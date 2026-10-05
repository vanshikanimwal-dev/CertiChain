package com.certichain.certificate;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CertificateRepository extends JpaRepository<CertificateEntity, String> {

    List<CertificateEntity> findAllByOrderByIssueDateDesc();

    long countByIdStartingWith(String prefix);
}
