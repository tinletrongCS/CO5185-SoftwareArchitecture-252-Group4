package com.irms.ordering_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration

public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "restaurant_exchange";
    public static final String ROUTING_KEY = "order.created";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    // chuyển object Java thành json để chuyển đi
    @Bean
    public MessageConverter converter() {
        return new JacksonJsonMessageConverter();
    }
}