package com.afperdomo.bodegatech.module.product;

import com.afperdomo.bodegatech.module.product.dto.CreateProductRequest;
import com.afperdomo.bodegatech.module.product.dto.ProductDto;
import com.afperdomo.bodegatech.module.product.dto.UpdateProductRequest;
import com.afperdomo.bodegatech.module.product.entity.Product;
import com.afperdomo.bodegatech.module.product.mapper.ProductMapper;
import com.afperdomo.bodegatech.module.product.repository.ProductRepository;
import com.afperdomo.bodegatech.module.product.service.ProductService;
import com.afperdomo.bodegatech.common.exception.BusinessException;
import com.afperdomo.bodegatech.common.exception.ResourceNotFoundException;
import com.afperdomo.bodegatech.common.response.PagedResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios del servicio ProductService.
 */
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductService productService;

    private Product product;
    private CreateProductRequest createRequest;
    private UpdateProductRequest updateRequest;
    private ProductDto productDto;
    private UUID productId;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();

        product = new Product();
        product.setId(productId);
        product.setName("Laptop Dell");
        product.setDescription("Laptop de 15 pulgadas");
        product.setPrice(new BigDecimal("1500.00"));
        product.setStock(10);
        product.setSku("DELL-LAPTOP-001");
        product.setCategory("Electrónica");
        product.setImageUrl("https://example.com/images/laptop.jpg");
        product.setIsActive(true);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());

        createRequest = new CreateProductRequest();
        createRequest.setName("Laptop Dell");
        createRequest.setDescription("Laptop de 15 pulgadas");
        createRequest.setPrice(new BigDecimal("1500.00"));
        createRequest.setStock(10);
        createRequest.setSku("DELL-LAPTOP-001");
        createRequest.setCategory("Electrónica");
        createRequest.setImageUrl("https://example.com/images/laptop.jpg");

        updateRequest = new UpdateProductRequest();
        updateRequest.setName("Laptop Dell Pro");
        updateRequest.setDescription("Laptop de 15 pulgadas actualizada");
        updateRequest.setPrice(new BigDecimal("1800.00"));
        updateRequest.setStock(5);
        updateRequest.setCategory("Electrónica");
        updateRequest.setImageUrl("https://example.com/images/laptop-pro.jpg");

        productDto = new ProductDto();
        productDto.setId(productId);
        productDto.setName("Laptop Dell");
        productDto.setDescription("Laptop de 15 pulgadas");
        productDto.setPrice(new BigDecimal("1500.00"));
        productDto.setStock(10);
        productDto.setSku("DELL-LAPTOP-001");
        productDto.setCategory("Electrónica");
        productDto.setImageUrl("https://example.com/images/laptop.jpg");
        productDto.setIsActive(true);
        productDto.setCreatedAt(LocalDateTime.now());
        productDto.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void testFindAllProducts() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> page = new PageImpl<>(List.of(product), pageable, 1);

        when(productRepository.findAllActive(pageable)).thenReturn(page);
        when(productMapper.toDto(product)).thenReturn(productDto);

        // Act
        PagedResponse<ProductDto> result = productService.findAllProducts(pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Laptop Dell", result.getContent().get(0).getName());
        verify(productRepository, times(1)).findAllActive(pageable);
    }

    @Test
    void testFindProductByIdSuccess() {
        // Arrange
        when(productRepository.findByIdActive(productId)).thenReturn(Optional.of(product));
        when(productMapper.toDto(product)).thenReturn(productDto);

        // Act
        ProductDto result = productService.findProductById(productId);

        // Assert
        assertNotNull(result);
        assertEquals("Laptop Dell", result.getName());
        verify(productRepository, times(1)).findByIdActive(productId);
    }

    @Test
    void testFindProductByIdNotFound() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(productRepository.findByIdActive(nonExistentId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
                productService.findProductById(nonExistentId)
        );
        verify(productRepository, times(1)).findByIdActive(nonExistentId);
    }

    @Test
    void testCreateProductSuccess() {
        // Arrange
        when(productRepository.findBySku(createRequest.getSku())).thenReturn(Optional.empty());
        when(productMapper.toEntity(createRequest)).thenReturn(product);
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(productMapper.toDto(product)).thenReturn(productDto);

        // Act
        ProductDto result = productService.createProduct(createRequest);

        // Assert
        assertNotNull(result);
        assertEquals("Laptop Dell", result.getName());
        verify(productRepository, times(1)).findBySku(createRequest.getSku());
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    void testCreateProductDuplicateSku() {
        // Arrange
        when(productRepository.findBySku(createRequest.getSku())).thenReturn(Optional.of(product));

        // Act & Assert
        assertThrows(BusinessException.class, () ->
                productService.createProduct(createRequest)
        );
        verify(productRepository, times(1)).findBySku(createRequest.getSku());
        verify(productRepository, never()).save(any());
    }

    @Test
    void testUpdateProductSuccess() {
        // Arrange
        when(productRepository.findByIdActive(productId)).thenReturn(Optional.of(product));
        doNothing().when(productMapper).updateEntity(updateRequest, product);
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(productMapper.toDto(product)).thenReturn(productDto);

        // Act
        ProductDto result = productService.updateProduct(productId, updateRequest);

        // Assert
        assertNotNull(result);
        verify(productRepository, times(1)).findByIdActive(productId);
        verify(productRepository, times(1)).save(any(Product.class));
        verify(productMapper, times(1)).updateEntity(updateRequest, product);
    }

    @Test
    void testUpdateProductNotFound() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(productRepository.findByIdActive(nonExistentId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
                productService.updateProduct(nonExistentId, updateRequest)
        );
        verify(productRepository, never()).save(any());
    }

    @Test
    void testDeleteProductSuccess() {
        // Arrange
        when(productRepository.findByIdActive(productId)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        // Act
        productService.deleteProduct(productId);

        // Assert
        assertFalse(product.getIsActive());
        verify(productRepository, times(1)).findByIdActive(productId);
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    void testDeleteProductNotFound() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(productRepository.findByIdActive(nonExistentId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
                productService.deleteProduct(nonExistentId)
        );
        verify(productRepository, never()).save(any());
    }
}
