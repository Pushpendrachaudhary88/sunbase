package com.example.demo.repository;



import com.example.demo.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository<Customer> extends JpaRepository<Customer, Long> {
}

