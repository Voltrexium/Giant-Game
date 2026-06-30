public class Player {
    int x;
    int y;
    int w = GameConstants.ENTITY_SIZE;
    int h = GameConstants.ENTITY_SIZE;
    int dx = 5;
    int dy = 5;

    void center() {
        x = y = GameConstants.WIDTH / 2;
    }
}
