import { app } from ".";
import logger from "./config/logger";
import dotenv from "dotenv";

dotenv.config();

// Menjalankan server
(async () => {
    try {
        // Port dari .env
        const port = Number(process.env.PORT) || 3000;

        app.listen(port, () => {
            logger.info(`Server berjalan di http://localhost:${port}`);
        });
    } catch (error) {
        // Logging error jika terjadi saat menjalankan server
        logger.error('Gagal menjalankan server:', error);
        // Stop aplikasi jika terjadi error
        process.exit(1);
    }
})();