package com.irms.ordering_service;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/test")
    public String sayHello() {
        return "Hello World on 8081";
    }
}