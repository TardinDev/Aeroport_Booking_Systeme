package com.skybooker.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.skybooker.entity.BoardingPass;
import com.skybooker.entity.Booking;
import com.skybooker.entity.Flight;
import com.skybooker.entity.Passenger;
import com.skybooker.entity.Seat;
import com.skybooker.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Generates a printable A6-sized PDF boarding pass with an embedded QR code.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BoardingPassPdfService {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("EEE dd MMM yyyy", Locale.ENGLISH);
    private static final DateTimeFormatter TIME_FORMAT =
            DateTimeFormatter.ofPattern("HH:mm", Locale.ENGLISH);

    public byte[] generate(BoardingPass boardingPass) {
        Booking booking = boardingPass.getBooking();
        Passenger passenger = boardingPass.getPassenger();
        if (booking == null || passenger == null) {
            throw new ResourceNotFoundException("BoardingPass", "id",
                    boardingPass.getId() == null ? "<new>" : boardingPass.getId().toString());
        }
        Flight flight = booking.getFlight();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A6.rotate(), 20, 20, 20, 20);
            PdfWriter.getInstance(document, out);
            document.open();

            // --- Header ---
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, new Color(30, 64, 175));
            Paragraph title = new Paragraph("SkyBooker | Boarding Pass", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);
            Paragraph reference = new Paragraph("Booking " + booking.getBookingReference(), subtitleFont);
            reference.setAlignment(Element.ALIGN_CENTER);
            reference.setSpacingAfter(8f);
            document.add(reference);

            // --- Passenger name ---
            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY);
            Font valueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.BLACK);

            PdfPTable passengerTable = new PdfPTable(1);
            passengerTable.setWidthPercentage(100);
            passengerTable.addCell(labelCell("PASSENGER", labelFont));
            passengerTable.addCell(valueCell(
                    (passenger.getFirstName() + " " + passenger.getLastName()).toUpperCase(Locale.ROOT),
                    valueFont));
            document.add(passengerTable);

            // --- Flight info ---
            PdfPTable flightTable = new PdfPTable(3);
            flightTable.setWidthPercentage(100);
            flightTable.setSpacingBefore(6f);

            flightTable.addCell(labelCell("FROM", labelFont));
            flightTable.addCell(labelCell("FLIGHT", labelFont));
            flightTable.addCell(labelCell("TO", labelFont));

            flightTable.addCell(valueCell(flight.getOriginCode(), valueFont));
            flightTable.addCell(valueCell(flight.getFlightNumber(), valueFont));
            flightTable.addCell(valueCell(flight.getDestinationCode(), valueFont));

            document.add(flightTable);

            // --- Dates & details ---
            PdfPTable detailsTable = new PdfPTable(4);
            detailsTable.setWidthPercentage(100);
            detailsTable.setSpacingBefore(6f);

            detailsTable.addCell(labelCell("DATE", labelFont));
            detailsTable.addCell(labelCell("BOARDING", labelFont));
            detailsTable.addCell(labelCell("GATE", labelFont));
            detailsTable.addCell(labelCell("SEAT", labelFont));

            detailsTable.addCell(valueCell(
                    flight.getDepartureTime() != null
                            ? flight.getDepartureTime().format(DATE_FORMAT)
                            : "-",
                    valueFont));
            detailsTable.addCell(valueCell(
                    flight.getDepartureTime() != null
                            ? flight.getDepartureTime().minusMinutes(30).format(TIME_FORMAT)
                            : "-",
                    valueFont));
            detailsTable.addCell(valueCell(
                    boardingPass.getGate() != null ? boardingPass.getGate() : "TBD",
                    valueFont));
            Seat seat = passenger.getSeat();
            detailsTable.addCell(valueCell(
                    seat != null ? seat.getRow() + seat.getSeatColumn() : "-",
                    valueFont));

            document.add(detailsTable);

            // --- QR code ---
            try {
                byte[] qrBytes = generateQrCode(boardingPass.getQrCode(), 180);
                Image qrImage = Image.getInstance(qrBytes);
                qrImage.setAlignment(Element.ALIGN_CENTER);
                qrImage.scaleAbsolute(90f, 90f);
                document.add(qrImage);

                Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 7, Color.GRAY);
                Paragraph group = new Paragraph(
                        "Boarding group: " + (boardingPass.getBoardingGroup() != null
                                ? boardingPass.getBoardingGroup() : "-"),
                        footerFont);
                group.setAlignment(Element.ALIGN_CENTER);
                document.add(group);
            } catch (WriterException | IOException e) {
                log.warn("Failed to embed QR code in boarding pass", e);
            }

            document.close();
            return out.toByteArray();

        } catch (DocumentException | IOException e) {
            log.error("Failed to generate boarding pass PDF", e);
            throw new IllegalStateException("Unable to generate boarding pass PDF", e);
        }
    }

    private PdfPCell labelCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
        cell.setPaddingBottom(1f);
        return cell;
    }

    private PdfPCell valueCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
        cell.setPaddingBottom(4f);
        return cell;
    }

    private byte[] generateQrCode(String content, int size) throws WriterException, IOException {
        QRCodeWriter qrWriter = new QRCodeWriter();
        BitMatrix matrix = qrWriter.encode(
                content == null ? "" : content,
                BarcodeFormat.QR_CODE,
                size,
                size);
        try (ByteArrayOutputStream qrOut = new ByteArrayOutputStream()) {
            MatrixToImageWriter.writeToStream(matrix, "PNG", qrOut);
            return qrOut.toByteArray();
        }
    }
}
