package com.irms.auth_service.service;

import com.irms.auth_service.dto.LoginRequest;
import com.irms.auth_service.dto.LoginResponse;
import com.irms.auth_service.dto.UserDTO;
import com.irms.auth_service.entity.UserEntity;
import com.irms.auth_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public LoginResponse login(LoginRequest request) {
        Optional<UserEntity> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            // In a real application, you would compare password hashes.
            // Here, for this prototype, we're doing a simple string comparison.
            if (user.getPassword().equals(request.getPassword())) {
                UserDTO userDTO = mapToDTO(user);
                // Simple dummy token
                String token = "dummy-jwt-token-" + user.getId();
                return new LoginResponse(token, userDTO);
            }
        }
        throw new RuntimeException("Invalid username or password");
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        return userRepository.findById(id).map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserDTO getUserByUsername(String username) {
        return userRepository.findByUsername(username).map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    public UserDTO createUser(UserDTO userDTO) {
        UserEntity user = new UserEntity();
        user.setUsername(userDTO.getUserName());
        user.setPassword(userDTO.getPassword());
        user.setRole(userDTO.getPermission() != null ? userDTO.getPermission() : "user");
        user = userRepository.save(user);
        return mapToDTO(user);
    }

    public UserDTO updateUser(Long id, UserDTO userDTO) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setUsername(userDTO.getUserName());
        user.setPassword(userDTO.getPassword());
        user.setRole(userDTO.getPermission() != null ? userDTO.getPermission() : "user");
        user = userRepository.save(user);
        return mapToDTO(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    private UserDTO mapToDTO(UserEntity user) {
        return new UserDTO(user.getId(), user.getUsername(), user.getPassword(), user.getRole());
    }
}