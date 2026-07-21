import app from "./app";
import PhajayRealtimeService from "./services/PhajayRealtimeService";

const port = Number(process.env.PORT) || 3003;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  PhajayRealtimeService.start();
});

