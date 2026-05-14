package vn.com.duylongtech.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    private String fullName;
    private String email;
    private String phone;
    private String role; // ADMIN, STAFF, CUSTOMER, SHIPPER

    // Tech-Care Prime
    @Column(name = "is_prime_member")
    private Boolean isPrimeMember;

    @Column(name = "prime_expiry")
    private java.time.LocalDateTime primeExpiry;
}
