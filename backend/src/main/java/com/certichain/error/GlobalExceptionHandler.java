package com.certichain.error;

import com.certichain.config.RequestIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.ErrorResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException exception, HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed.");
        problem.setTitle("Bad Request");
        problem.setProperty("requestId", requestId(request));
        problem.setProperty(
                "errors",
                exception.getBindingResult().getFieldErrors().stream()
                        .map(error -> error.getField() + ": " + error.getDefaultMessage())
                        .toList());
        return problem;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnexpected(Exception exception, HttpServletRequest request) {
        if (exception instanceof ErrorResponse errorResponse && !errorResponse.getStatusCode().is5xxServerError()) {
            ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                    errorResponse.getStatusCode(),
                    errorResponse.getBody().getDetail() == null
                            ? errorResponse.getStatusCode().toString()
                            : errorResponse.getBody().getDetail());
            problem.setTitle(title(errorResponse));
            problem.setProperty("requestId", requestId(request));
            return problem;
        }

        log.error("Unhandled request failure", exception);
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred.");
        problem.setTitle("Internal Server Error");
        problem.setProperty("requestId", requestId(request));
        return problem;
    }

    private static String title(ErrorResponse errorResponse) {
        if (errorResponse.getBody().getTitle() != null) {
            return errorResponse.getBody().getTitle();
        }
        HttpStatusCode status = errorResponse.getStatusCode();
        if (status instanceof HttpStatus httpStatus) {
            return httpStatus.getReasonPhrase();
        }
        return status.toString();
    }

    private static Object requestId(HttpServletRequest request) {
        Object requestId = request.getAttribute(RequestIdFilter.ATTRIBUTE);
        return requestId == null ? "" : requestId;
    }
}
