/**
 * UI module for managing the Angular frontend.
 * 
 * This module contains the Angular frontend application that is embedded in the Java application
 * as a static resource. During the Maven build process, the Angular application is built and
 * the resulting files are copied to the /static directory in the classpath, allowing them to be
 * served by the Spring Boot application.
 * 
 * The integration is configured in the following components:
 * - pom.xml: Contains the frontend-maven-plugin to build the Angular app and the maven-resources-plugin
 *   to copy the built files to the static resources directory.
 * - WebConfig: Configures Spring MVC to serve the Angular app and handle client-side routing.
 * - SecurityConfig: Configures Spring Security to allow access to the static resources.
 */
@org.springframework.modulith.NamedInterface(name = "UI API")
package com.moneyplant.ui;

import org.springframework.modulith.Modulith;
