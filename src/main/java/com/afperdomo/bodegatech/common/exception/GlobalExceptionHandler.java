package com.afperdomo.bodegatech.common.exception;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.math.BigDecimal;
import java.net.URI;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Manejador global de excepciones.
 * Las respuestas de error siguen el estándar RFC 9457 (ProblemDetail).
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String BASE_TYPE = "https://bodegatech.com/errors/";

    // -------------------------------------------------------------------------
    // Helpers privados
    // -------------------------------------------------------------------------

    private ProblemDetail buildProblem(HttpStatus status, String typeSlug,
            String title, String detail, String instance) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setType(URI.create(BASE_TYPE + typeSlug));
        problem.setTitle(title);
        problem.setInstance(URI.create(instance));
        problem.setProperty("timestamp", LocalDateTime.now().truncatedTo(ChronoUnit.MILLIS).toString());
        return problem;
    }

    private String traducirTipo(Class<?> tipo) {
        if (tipo == Integer.class || tipo == Long.class) return "un número entero";
        if (tipo == BigDecimal.class || tipo == Double.class) return "un número decimal";
        if (tipo == Boolean.class) return "un valor true o false";
        if (tipo == LocalDateTime.class) return "una fecha con formato yyyy-MM-ddTHH:mm:ss";
        return "un valor de tipo " + tipo.getSimpleName();
    }

    /**
     * Verifica si la excepción proviene de SpringDoc y debe ser ignorada.
     */
    private boolean isSpringDocException(Throwable ex) {
        if (ex == null) return false;

        String className = ex.getClass().getName();
        if (className.startsWith("org.springdoc")
                || className.contains("springdoc")
                || className.startsWith("io.swagger")) {
            return true;
        }

        Throwable cause = ex.getCause();
        while (cause != null && cause != ex) {
            String causeClassName = cause.getClass().getName();
            if (causeClassName.startsWith("org.springdoc")
                    || causeClassName.contains("springdoc")
                    || causeClassName.startsWith("io.swagger")) {
                return true;
            }
            cause = cause.getCause();
        }

        return false;
    }

    /**
     * Verifica si el request es para un endpoint de SpringDoc.
     */
    private boolean isSpringDocEndpoint(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.contains("/docs")
                || path.contains("/swagger-ui")
                || path.contains("/swagger-resources")
                || path.contains("/webjars");
    }

    // -------------------------------------------------------------------------
    // 404 — Recurso no encontrado
    // -------------------------------------------------------------------------

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ProblemDetail> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {

        ProblemDetail problem = buildProblem(
                HttpStatus.NOT_FOUND,
                "not-found",
                "Recurso no encontrado",
                ex.getMessage(),
                request.getRequestURI()
        );

        log.warn("Recurso no encontrado en {}: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problem);
    }

    // -------------------------------------------------------------------------
    // 409 — Conflicto de negocio
    // -------------------------------------------------------------------------

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ProblemDetail> handleBusiness(
            BusinessException ex, HttpServletRequest request) {

        ProblemDetail problem = buildProblem(
                HttpStatus.CONFLICT,
                "conflict",
                "Conflicto de negocio",
                ex.getMessage(),
                request.getRequestURI()
        );

        log.warn("Conflicto de negocio en {}: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problem);
    }

    // -------------------------------------------------------------------------
    // 400 — Errores de validación de campos (@Valid)
    // -------------------------------------------------------------------------

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidationErrors(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));

        int count = errors.size();
        String detail = "Se encontr" + (count == 1 ? "ó 1 error" : "aron " + count + " errores")
                + " de validación en la solicitud";

        ProblemDetail problem = buildProblem(
                HttpStatus.BAD_REQUEST,
                "validation-error",
                "Errores de validación",
                detail,
                request.getRequestURI()
        );
        problem.setProperty("errors", errors);

        log.warn("Validación fallida en {}: {}", request.getRequestURI(), errors);
        return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problem);
    }

    // -------------------------------------------------------------------------
    // 400 — JSON malformado o tipo de campo incorrecto
    // -------------------------------------------------------------------------

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ProblemDetail> handleJsonParseError(
            HttpMessageNotReadableException ex, HttpServletRequest request) {

        Map<String, String> errors = new LinkedHashMap<>();
        Throwable causa = ex.getCause();

        if (causa instanceof InvalidFormatException invalidFormat) {
            String campo = invalidFormat.getPath().isEmpty()
                    ? "desconocido"
                    : invalidFormat.getPath().getFirst().getFieldName();
            errors.put(campo, "Se esperaba " + traducirTipo(invalidFormat.getTargetType()));
        } else {
            errors.put("body", "El JSON enviado tiene un formato inválido");
        }

        ProblemDetail problem = buildProblem(
                HttpStatus.BAD_REQUEST,
                "validation-error",
                "Errores de validación",
                "Se encontró 1 error de validación en la solicitud",
                request.getRequestURI()
        );
        problem.setProperty("errors", errors);

        log.warn("JSON inválido en {}: {}", request.getRequestURI(), errors);
        return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problem);
    }

    // -------------------------------------------------------------------------
    // 500 — Error inesperado
    // -------------------------------------------------------------------------

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleUnexpected(
            Exception ex, HttpServletRequest request) throws Exception {

        // Las excepciones de SpringDoc deben propagarse para que Swagger funcione
        if (isSpringDocException(ex) || isSpringDocEndpoint(request)) {
            throw ex;
        }

        ProblemDetail problem = buildProblem(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "internal-error",
                "Error interno del servidor",
                "Ocurrió un error inesperado. Por favor intente más tarde",
                request.getRequestURI()
        );

        log.error("Error inesperado en {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problem);
    }
}
