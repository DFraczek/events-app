package com.An0.eventsapp.controller;

import com.An0.eventsapp.config.JwtTokenUtil;
import com.An0.eventsapp.entity.User;
import com.An0.eventsapp.enums.UserRole;
import com.An0.eventsapp.model.JwtRequest;
import com.An0.eventsapp.model.JwtResponse;
import com.An0.eventsapp.repository.UserRepository;
import com.An0.eventsapp.service.JwtUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class JwtAuthenticationController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;
    private final JwtUserDetailsService userDetailsService;

    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody JwtRequest authenticationRequest) {
        try {
            authenticate(authenticationRequest.getEmail(), authenticationRequest.getPassword());
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Błędny email lub hasło");
        } catch (DisabledException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Konto jest nieaktywne");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Błąd logowania");
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authenticationRequest.getEmail());

        final String token = jwtTokenUtil.generateToken(userDetails);

        User user = userRepository.findByEmail(authenticationRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

       return ResponseEntity.ok(new JwtResponse(token, user.getId(), user.getEmail()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> saveUser(@RequestBody User user) {
        if (userDetailsService.findByEmail(user.getEmail()) != null) {
            return ResponseEntity.badRequest().body("Użytkownik z tym emailem już istnieje");
        }

        if (user.getRole() == null) {
            user.setRole(UserRole.USER);
        }

        User savedUser = userDetailsService.save(user);

        savedUser.setPassword(null);
        return ResponseEntity.ok(savedUser);
    }

    private void authenticate(String email, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
    }
}