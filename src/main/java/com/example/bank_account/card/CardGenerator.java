package com.example.bank_account.card;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class CardGenerator {

    private static final SecureRandom rnd = new SecureRandom();
    private static final DateTimeFormatter EXP_FMT = DateTimeFormatter.ofPattern("MM/yy");

    public static String generatePan16() {
        // Пример: фикс BIN 400000 + 10 случайных цифр = 16
        StringBuilder sb = new StringBuilder("400000");
        while (sb.length() < 16) {
            sb.append(rnd.nextInt(10));
        }
        return sb.toString();
    }

    public static LocalDate generateExpiry3Years() {
        return LocalDate.now().plusYears(3).withDayOfMonth(1);
    }


    public static String generateCvv() {
        int cvv = 100 + rnd.nextInt(900); // 100..999
        return String.valueOf(cvv);
    }

    private CardGenerator() {}
}
