import java.awt.Graphics2D;

public interface GameScreen {
    void onEnter(KeyboardInput keyboard);

    void update(Graphics2D graphics) throws InterruptedException;

    boolean isDone();

    default void onExit() {}
}
