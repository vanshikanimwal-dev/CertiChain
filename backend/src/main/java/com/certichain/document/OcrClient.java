package com.certichain.document;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;

@Component
public class OcrClient {

    private final RestClient http;
    private final String url;

    public OcrClient(@Value("${certichain.ocr.url}") String url) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(2));
        factory.setReadTimeout(Duration.ofSeconds(25));
        this.http = RestClient.builder().requestFactory(factory).build();
        this.url = url;
    }

    public String extract(byte[] bytes) {
        ByteArrayResource resource = new ByteArrayResource(bytes) {
            @Override
            public String getFilename() {
                return "document.png";
            }
        };
        LinkedMultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", resource);
        Extracted extracted = http.post()
                .uri(url + "/extract")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(Extracted.class);
        if (extracted == null || extracted.text() == null || extracted.text().isBlank()) {
            throw new IllegalStateException(extracted == null ? "The image reader returned nothing." : extracted.note());
        }
        return extracted.text();
    }

    private record Extracted(String text, String note) {
    }
}
