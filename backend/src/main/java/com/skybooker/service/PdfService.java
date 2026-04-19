package com.skybooker.service;

import com.itextpdf.barcodes.BarcodeQRCode;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.skybooker.entity.Booking;
import com.skybooker.entity.Flight;
import com.skybooker.entity.Passenger;
import com.skybooker.entity.Seat;
import com.skybooker.enums.Role;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class PdfService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter
            .ofPattern("dd MMM uuuu  HH:mm 'UTC'", Locale.ENGLISH)
            .withZone(ZoneId.of("UTC"));

    private static final DeviceRgb BRAND_COLOR = new DeviceRgb(37, 99, 235);

    private final BookingService bookingService;

    public PdfService(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @Transactional(readOnly = true)
    public byte[] generateTicketPdf(Long bookingId, Long userId, Role role) {
        Booking booking = bookingService.getBookingEntity(bookingId, userId, role);
        return renderPdf(booking);
    }

    private byte[] renderPdf(Booking booking) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PdfWriter writer = new PdfWriter(baos);
             PdfDocument pdf = new PdfDocument(writer);
             Document doc = new Document(pdf)) {

            PdfFont bold = PdfFontFactory.createFont("Helvetica-Bold");
            PdfFont regular = PdfFontFactory.createFont("Helvetica");

            doc.add(new Paragraph("SkyBooker")
                    .setFont(bold)
                    .setFontSize(26)
                    .setFontColor(BRAND_COLOR));

            doc.add(new Paragraph("Electronic Ticket")
                    .setFont(regular)
                    .setFontSize(12)
                    .setFontColor(ColorConstants.DARK_GRAY));

            doc.add(new Paragraph("Booking reference: " + booking.getBookingReference())
                    .setFont(bold)
                    .setFontSize(14)
                    .setMarginTop(18f));

            doc.add(new Paragraph("Status: " + booking.getStatus())
                    .setFont(regular)
                    .setFontSize(11));

            Flight flight = booking.getFlight();
            Table flightTable = new Table(UnitValue.createPercentArray(new float[]{1, 2}))
                    .useAllAvailableWidth()
                    .setMarginTop(18f);

            flightTable.addCell(cell("Flight", bold));
            flightTable.addCell(cell(flight.getAirline().getIataCode() + " " + flight.getFlightNumber(), regular));

            flightTable.addCell(cell("From", bold));
            flightTable.addCell(cell(flight.getOrigin().getIataCode() + " — " + flight.getOrigin().getCity()
                    + " (" + flight.getOrigin().getName() + ")", regular));

            flightTable.addCell(cell("To", bold));
            flightTable.addCell(cell(flight.getDestination().getIataCode() + " — " + flight.getDestination().getCity()
                    + " (" + flight.getDestination().getName() + ")", regular));

            flightTable.addCell(cell("Departure", bold));
            flightTable.addCell(cell(DATE_FMT.format(flight.getDepartureTime()), regular));

            flightTable.addCell(cell("Arrival", bold));
            flightTable.addCell(cell(DATE_FMT.format(flight.getArrivalTime()), regular));

            doc.add(flightTable);

            doc.add(new Paragraph("Passengers")
                    .setFont(bold)
                    .setFontSize(13)
                    .setMarginTop(18f));

            Table paxTable = new Table(UnitValue.createPercentArray(new float[]{3, 2, 1}))
                    .useAllAvailableWidth();
            paxTable.addHeaderCell(cell("Name", bold));
            paxTable.addHeaderCell(cell("Passport", bold));
            paxTable.addHeaderCell(cell("Seat", bold));
            for (Passenger p : booking.getPassengers()) {
                paxTable.addCell(cell(p.getFirstName() + " " + p.getLastName(), regular));
                paxTable.addCell(cell(p.getPassportNumber(), regular));
                Seat seat = p.getSeat();
                paxTable.addCell(cell(seat != null ? seat.label() + " / " + seat.getSeatClass() : "—", regular));
            }
            doc.add(paxTable);

            doc.add(new Paragraph("Total: " + booking.getTotalPrice().toPlainString() + " EUR")
                    .setFont(bold)
                    .setFontSize(14)
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setMarginTop(14f));

            BarcodeQRCode qrCode = new BarcodeQRCode(booking.getBookingReference());
            Image qrImage = new Image(qrCode.createFormXObject(pdf))
                    .setWidth(100)
                    .setHeight(100)
                    .setMarginTop(18f);
            doc.add(qrImage);

            doc.add(new Paragraph("Keep this document until the end of your journey.")
                    .setFont(regular)
                    .setFontSize(9)
                    .setFontColor(ColorConstants.GRAY)
                    .setMarginTop(4f));

        } catch (IOException ex) {
            throw new IllegalStateException("Failed to render PDF ticket", ex);
        }
        return baos.toByteArray();
    }

    private static Cell cell(String text, PdfFont font) {
        return new Cell().add(new Paragraph(text).setFont(font).setFontSize(11)).setPadding(4f);
    }
}
