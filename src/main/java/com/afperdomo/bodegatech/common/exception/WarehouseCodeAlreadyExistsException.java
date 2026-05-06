package com.afperdomo.bodegatech.common.exception;

public class WarehouseCodeAlreadyExistsException extends BusinessException {
    public WarehouseCodeAlreadyExistsException(String code) {
        super("WAREHOUSE_CODE_ALREADY_EXISTS", "El código de bodega " + code + " ya está registrado");
    }
}
