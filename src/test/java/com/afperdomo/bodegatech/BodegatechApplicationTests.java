package com.afperdomo.bodegatech;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Requiere PostgreSQL en ejecución. Ejecutar: docker-compose up -d")
class BodegatechApplicationTests {

	@Test
	void contextLoads() {
	}

}
