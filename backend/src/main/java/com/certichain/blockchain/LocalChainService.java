package com.certichain.blockchain;

import com.certichain.certificate.CertificateEntity;
import com.certichain.crypto.CanonicalHasher;
import org.springframework.stereotype.Service;

@Service
public class LocalChainService {

    public static final String ANCHORED_LOCALLY = "ANCHORED_LOCALLY";
    public static final String NOT_ANCHORED = "NOT_ANCHORED";

    public void anchor(CertificateEntity certificate) {
        if (certificate.getDocumentHash() == null || certificate.getDocumentHash().isBlank()) {
            certificate.setChainStatus(NOT_ANCHORED);
            certificate.setChainTxHash("");
            return;
        }
        certificate.setChainStatus(ANCHORED_LOCALLY);
        certificate.setChainTxHash("local-" + CanonicalHasher.sha256(certificate.getId() + "|" + certificate.getDocumentHash()).substring(0, 16));
    }
}
