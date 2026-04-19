package com.skybooker.mapper;

import com.skybooker.dto.response.UserResponse;
import com.skybooker.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toResponse(User user);
}
