import java.io.IOException;

public final class GameApp {
    private static String controlScheme = "";
    private static final GameWindow window = GameWindow.getInstance();

    private GameApp() {}

    public static void start() throws InterruptedException, IOException {
        controlScheme = MenuScreen.selectControlScheme();
        runMainLoop(0);
    }

    public static void showGameMenu(String control, int money, java.awt.image.BufferedImage buffer)
        throws InterruptedException, IOException {
        controlScheme = control;
        runMainLoop(money);
    }

    private static void runMainLoop(int money) throws InterruptedException, IOException {
        while (true) {
            money = MoneyStore.loadOrDefault(money);
            System.out.println(money);

            String choice = MenuScreen.selectGame();
            if ("E".equals(choice)) {
                return;
            }
            if ("R".equals(choice)) {
                money = runCircleGameSession(controlScheme, money, CircleGame.Mode.ORIGINAL, 0, 0);
            } else if ("S".equals(choice)) {
                money = runCircleGameSession(controlScheme, money, CircleGame.Mode.SWARM, 0, 0);
            } else if ("G".equals(choice)) {
                money = runGravitySession(controlScheme, money);
            } else if ("F".equals(choice)) {
                money = runFighterSession(controlScheme, money);
            }
        }
    }

    public static void runCircleGame(
        String control,
        int startingMoney,
        CircleGame.Mode mode,
        int enemyCount,
        int startingPoints
    ) throws InterruptedException, IOException {
        runCircleGameSession(control, startingMoney, mode, enemyCount, startingPoints);
    }

    private static int runCircleGameSession(
        String control,
        int startingMoney,
        CircleGame.Mode mode,
        int enemyCount,
        int startingPoints
    ) throws InterruptedException, IOException {
        int money = startingMoney;
        int enemies = enemyCount;
        int points = startingPoints;

        while (true) {
            CircleGame game = CircleGame.create(control, money, mode, enemies, points);
            window.runScreen(game);

            if (game.isQuitToMenu()) {
                return game.getMoney();
            }

            money = game.applySessionEarnings();
            Thread.sleep(3000);

            String choice = MenuScreen.playAgainPrompt();
            if ("Y".equals(choice)) {
                money = mode == CircleGame.Mode.ORIGINAL ? money * money : money;
                enemies = 0;
                points = 0;
                continue;
            }
            if ("R".equals(choice) && money >= 100) {
                money -= 100;
                money = mode == CircleGame.Mode.ORIGINAL ? money * money : money;
                enemies = game.getEnemyCount();
                points = game.getPoints();
                continue;
            }

            return money;
        }
    }

    public static void runGravity(String control, int startingMoney) throws InterruptedException, IOException {
        runGravitySession(control, startingMoney);
    }

    private static int runGravitySession(String control, int startingMoney) throws InterruptedException, IOException {
        int money = startingMoney;

        while (true) {
            Gravity game = Gravity.create(control, money);
            window.runScreen(game);

            if (game.isQuitToMenu()) {
                return game.getMoney();
            }

            Thread.sleep(3000);
            String choice = MenuScreen.playAgainPrompt();
            if ("Y".equals(choice)) {
                continue;
            }

            return money;
        }
    }

    public static void runFighter(String control, int startingMoney) throws InterruptedException, IOException {
        runFighterSession(control, startingMoney);
    }

    private static int runFighterSession(String control, int startingMoney) throws InterruptedException, IOException {
        int money = startingMoney;

        while (true) {
            tpv game = tpv.create(control, money);
            window.runScreen(game);

            if (game.isQuitToMenu()) {
                return game.getMoney();
            }

            Thread.sleep(3000);
            money = game.applySessionEarnings();

            String choice = MenuScreen.playAgainPrompt();
            if ("Y".equals(choice)) {
                continue;
            }

            return money;
        }
    }
}
