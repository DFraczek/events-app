package com.An0.eventsapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;

import java.net.InetAddress;
import java.net.UnknownHostException;

@SpringBootApplication
public class EventsappApplication {

	public static void main(String[] args) {
		ConfigurableApplicationContext context = SpringApplication.run(EventsappApplication.class, args);
		printApplicationUrl(context);
	}

	private static void printApplicationUrl(ConfigurableApplicationContext context) {
		Environment env = context.getEnvironment();
		String protocol = "http";
		String port = env.getProperty("server.port", "8080");
		String hostAddress = "localhost";

		try {
			hostAddress = InetAddress.getLocalHost().getHostAddress();
		} catch (UnknownHostException e) {
		}

		System.out.println("\n----------------------------------------------------------");
		System.out.println("Aplikacja działa pod adresem:");
		System.out.println(protocol + "://localhost:" + port);
		System.out.println("----------------------------------------------------------\n");
	}


}