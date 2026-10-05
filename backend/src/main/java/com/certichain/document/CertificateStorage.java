package com.certichain.document;

import com.certichain.certificate.CertificateEntity;
import com.certichain.crypto.CanonicalHasher;
import com.certichain.student.StudentEntity;
import java.net.URI;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

@Service
public class CertificateStorage {

    private static final Logger log = LoggerFactory.getLogger(CertificateStorage.class);

    private final S3Client client;
    private final String bucket;

    public CertificateStorage(
            @Value("${certichain.storage.endpoint}") String endpoint,
            @Value("${certichain.storage.access-key}") String accessKey,
            @Value("${certichain.storage.secret-key}") String secretKey,
            @Value("${certichain.storage.bucket}") String bucket) {
        this.bucket = bucket;
        this.client = S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.US_EAST_1)
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
                .forcePathStyle(true)
                .build();
    }

    public boolean store(CertificateEntity certificate, byte[] pdf) {
        try {
            ensureBucket();
            String key = "certificates/" + certificate.getId() + ".pdf";
            client.putObject(
                    PutObjectRequest.builder().bucket(bucket).key(key).contentType("application/pdf").build(),
                    RequestBody.fromBytes(pdf));
            certificate.setFileKey(key);
            certificate.setFileHash(CanonicalHasher.sha256(pdf));
            return true;
        } catch (Exception exception) {
            log.warn("Could not store the certificate PDF: {}", exception.getMessage());
            return false;
        }
    }

    public byte[] loadOrCreate(CertificateEntity certificate, StudentEntity student) {
        if (certificate.getFileKey() != null && !certificate.getFileKey().isBlank()) {
            try {
                return client.getObjectAsBytes(GetObjectRequest.builder().bucket(bucket).key(certificate.getFileKey()).build()).asByteArray();
            } catch (Exception exception) {
                log.warn("Stored PDF for {} was not readable: {}", certificate.getId(), exception.getMessage());
            }
        }
        byte[] pdf = CertificatePdf.render(certificate, student);
        store(certificate, pdf);
        return pdf;
    }

    private void ensureBucket() {
        try {
            client.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
        } catch (S3Exception exception) {
            if (exception.statusCode() != 404) {
                throw exception;
            }
            client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
        }
    }
}
