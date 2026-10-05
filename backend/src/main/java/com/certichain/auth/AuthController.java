package com.certichain.auth;

import com.certichain.security.JwtService;
import com.certichain.user.UserAccountRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class AuthController {

    private final UserAccountRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserAccountRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/api/auth/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        var user = users.findByEmailIgnoreCase(request.email().trim())
                .filter(account -> passwordEncoder.matches(request.password(), account.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "That email or password does not match the demo admin account."));
        return new LoginResponse(jwtService.issue(user.getEmail()), user.getFullName(), user.getEmail(), user.getRole());
    }

    @GetMapping("/api/auth/me")
    public LoginResponse me() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in again."));
        return new LoginResponse(null, user.getFullName(), user.getEmail(), user.getRole());
    }

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {
    }

    public record LoginResponse(String token, String name, String email, String role) {
    }
}
