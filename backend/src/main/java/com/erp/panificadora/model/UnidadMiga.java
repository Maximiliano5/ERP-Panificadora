package com.erp.panificadora.model;

public enum UnidadMiga {
    ENTERO, MEDIO;

    public double equivalencia() {
        return this == ENTERO ? 1.0 : 0.5;
    }
}
