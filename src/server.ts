import express from "express";
import bodyParser from "body-parser";
import { KnexRiderRepository } from "./ports/knex-rider.repository";
import { KnexBookingRepository } from "./ports/knex-booking.repository";
import { KnexDriverRepository } from "./ports/knex-driver.repository";
import db from "./ports/knex.client";
import { createBookRideUseCase, createCancelBookingUseCase } from "./usecases/book-ride.usecase";
import { createListRideHistoryUseCase } from "./usecases/list-ride-history.usecase";
import { GoogleDistanceApi } from "./api/google-distance.api";
import { SystemCalendar } from "./domain/interfaces/calendar.service";

const app = express();
app.use(bodyParser.json());

const riderRepo = new KnexRiderRepository(db);
const bookingRepo = new KnexBookingRepository(db);
const driverRepo = new KnexDriverRepository(db);
const calendar = new SystemCalendar()
const distanceCalculator = new GoogleDistanceApi();

const bookRide = createBookRideUseCase(riderRepo, bookingRepo, driverRepo, calendar, distanceCalculator);
const cancelRide = createCancelBookingUseCase(riderRepo, bookingRepo);
const listHistory = createListRideHistoryUseCase(bookingRepo);

app.post("/book", async (req, res) => {
  try {
    const { riderId, from, to } = req.body;
    const rider = await riderRepo.findById(riderId);
    const booking = await bookRide(rider!, from, to);
    res.status(201).json(booking);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/cancel", async (req, res) => {
  try {
    const { riderId } = req.body;
    const rider = await riderRepo.findById(riderId);
    const canceled = await cancelRide(rider!);
    res.json(canceled);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/history/:riderId", async (req, res) => {
  const bookings = await listHistory(req.params.riderId);
  res.json(bookings);
});

app.listen(3000, () => console.log("🚀 Server running on port 3000"));
