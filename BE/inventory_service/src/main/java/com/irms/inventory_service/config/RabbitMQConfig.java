package com.irms.inventory_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Dùng chung exchange với ordering_service
    public static final String EXCHANGE_NAME = "restaurant_exchange";

    // Routing key riêng cho inventory
    public static final String INVENTORY_ROUTING_KEY = "inventory.changed";
    public static final String INVENTORY_QUEUE = "inventory.changed.queue";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue inventoryChangedQueue() {
        return new Queue(INVENTORY_QUEUE, true);
    }

    @Bean
    public Binding inventoryChangedBinding(Queue inventoryChangedQueue, TopicExchange exchange) {
        return BindingBuilder
                .bind(inventoryChangedQueue)
                .to(exchange)
                .with(INVENTORY_ROUTING_KEY);
    }

    @Bean
    public MessageConverter converter() {
        return new Jackson2JsonMessageConverter();
    }
}
