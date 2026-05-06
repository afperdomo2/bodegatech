package com.afperdomo.bodegatech.common.exception;

public class NitAlreadyExistsException extends BusinessException {
    public NitAlreadyExistsException(String nit) {
        super("NIT_ALREADY_EXISTS", "El NIT " + nit + " ya está registrado");
    }
}
