package com.hiskel.automated1;


import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

import java.io.*;


public class SeleniumText {
    static WebDriver driver;

    public static void main(String[] args) {
        System.setProperty("webdriver.chrome.driver", "D:/CLASS/third_year/2nd_Sem/SE/selenium/chromedriver.exe");

        driver = new ChromeDriver();

//        facebook_login(Secrets.Facebook.UNAME, Secrets.Facebook.PASS);
        get_and_write_news();
        close();
    }

    private static void sleep(int sec) {
        try {
            Thread.sleep(sec * 1000);
        }catch (Exception e) {

        }
    }

    private static void close() {
        driver.close();
    }

    public static void facebook_login(String uname, String pass) {
        driver.get("https://en-gb.facebook.com/login");

        WebElement uname_field = driver.findElement(By.name("email"));
        WebElement pass_field = driver.findElement(By.name("pass"));
        WebElement login_btn = driver.findElement(By.name("login"));

//        sleep(10);
        uname_field.sendKeys(uname);
        pass_field.sendKeys(pass);
        login_btn.click();

        WebElement notifCount = driver.findElement(By.id("notificationsCountValue"));
        System.out.println("Notifications: " + notifCount.getText());
        sleep(10);
    }

    public static void get_and_write_news() {
        WebDriver my_site_driver = new ChromeDriver();
        my_site_driver.get("http://localhost:3000/upload");

        WebElement comment_input = my_site_driver.findElement(By.id("upload-content"));
        WebElement upload_btn = my_site_driver.findElement(By.id("upload"));

        while (true) {
            driver.get("https://www.aljazeera.com/topics/country/ethiopia.html");

            WebElement news = driver.findElement(By.className("topics-sec-block"));

            comment_input.clear();
            comment_input.sendKeys(news.getText());
            upload_btn.click();

//            System.out.println(news.getText());
            sleep(100);
        }
    }


}
