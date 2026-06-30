import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;

public final class MoneyStore {
    private static final String FILE = "money.txt";

    private MoneyStore() {}

    public static int load() throws IOException {
        int stored = 0;
        BufferedReader reader = new BufferedReader(new FileReader(FILE));
        try {
            StringBuilder content = new StringBuilder();
            String line = reader.readLine();
            while (line != null) {
                content.append(line);
                line = reader.readLine();
            }
            String text = content.toString().trim();
            if (!text.isEmpty()) {
                int quoteIndex = text.indexOf('"');
                if (quoteIndex >= 0) {
                    text = text.substring(quoteIndex);
                }
                stored = Integer.parseInt(text.replaceAll("[^0-9-]", ""));
            }
        } finally {
            reader.close();
        }
        return stored;
    }

    public static void save(int total) throws IOException {
        FileWriter writer = new FileWriter(FILE);
        try {
            PrintWriter printer = new PrintWriter(writer);
            printer.print(total);
            printer.close();
        } finally {
            writer.close();
        }
    }

    public static int loadOrDefault(int fallback) throws IOException {
        int stored = load();
        return stored != 0 ? stored : fallback;
    }

    public static void addEarnings(int sessionEarnings) throws IOException {
        save(load() + sessionEarnings);
    }
}
