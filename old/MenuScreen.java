import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.event.KeyEvent;

public final class MenuScreen {
    private MenuScreen() {}

    public static String selectControlScheme() throws InterruptedException {
        return runPrompt(
            new String[] {
                "Input 1:",
                "Press M to use Mouse",
                "Press W to use WASD"
            },
            new int[] { KeyEvent.VK_M, KeyEvent.VK_W },
            new String[] { "M", "W" }
        );
    }

    public static String selectGame() throws InterruptedException {
        return runPrompt(
            new String[] {
                "Input 2:",
                "Press R to play Original",
                "Press S to play Swarm",
                "Press G to play Gravity",
                "Press F to play Fighter",
                "Press ESC to quit"
            },
            new int[] {
                KeyEvent.VK_R,
                KeyEvent.VK_S,
                KeyEvent.VK_G,
                KeyEvent.VK_F,
                KeyEvent.VK_ESCAPE
            },
            new String[] { "R", "S", "G", "F", "E" }
        );
    }

    public static String playAgainPrompt() throws InterruptedException {
        return runPrompt(
            new String[] {
                "Input 2:",
                "Press N to quit",
                "Press Y to play again",
                "Press R to revive yourself"
            },
            new int[] { KeyEvent.VK_Y, KeyEvent.VK_N, KeyEvent.VK_R },
            new String[] { "Y", "N", "R" }
        );
    }

    private static String runPrompt(String[] lines, int[] keyCodes, String[] values)
        throws InterruptedException {
        PromptScreen screen = new PromptScreen(lines, keyCodes, values);
        GameWindow.getInstance().runScreen(screen);
        return screen.getSelection();
    }

    private static final class PromptScreen implements GameScreen {
        private final String[] lines;
        private final int[] keyCodes;
        private final String[] values;
        private KeyboardInput keyboard;
        private String selection = "";

        private PromptScreen(String[] lines, int[] keyCodes, String[] values) {
            this.lines = lines;
            this.keyCodes = keyCodes;
            this.values = values;
        }

        private String getSelection() {
            return selection;
        }

        @Override
        public void onEnter(KeyboardInput keyboard) {
            this.keyboard = keyboard;
            selection = "";
        }

        @Override
        public void update(Graphics2D graphics) {
            graphics.setColor(Color.GREEN);
            int y = 500;
            for (String line : lines) {
                graphics.drawString(line, 450, y);
                y += 12;
            }

            for (int i = 0; i < keyCodes.length; i++) {
                if (keyboard.keyDown(keyCodes[i])) {
                    selection = values[i];
                }
            }

            if (!selection.isEmpty()) {
                graphics.drawString(selection + " it is...", 485, y + 12);
            }
        }

        @Override
        public boolean isDone() {
            return !selection.isEmpty();
        }
    }
}
