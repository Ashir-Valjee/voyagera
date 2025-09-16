import { describe, it, expect, vi, afterEach} from "vitest";
import { apollo } from "../../lib/apollo";


import {
  fetchSingleActivityBooking,
  fetchActivityBookingByFlight,
  fetchActivityBookingsByUser,
  createActivityBooking,
  updateActivityBooking,
  deleteActivityBooking,
} from "../../services/activity_booking";


vi.mock("../../lib/apollo", () => ({
  apollo: {
    query: vi.fn(),
    mutate: vi.fn(),
  },
}));

describe("Activity Service Functions", () => {
    afterEach(() => {
    vi.resetAllMocks();
    });

  // Fetch single activity
    it("fetchSingleActivityBooking returns single activity", async () => {
        const mockActivity = { id:"1", activityName: "Test Dinner"};
        apollo.query.mockResolvedValue({ data: { singleActivityBooking: mockActivity} });

        const result = await fetchSingleActivityBooking(1);
        expect(result).toEqual(mockActivity);
        expect(apollo.query).toHaveBeenCalledWith({
            query: expect.any(Object),
            variables: { id: 1},
            fetchPolicy: "network-only",
        });
    });

  //Fetch activity by flight id
    it("fetchActivityBookingByFlight returns activities for a flight", async () => {
        const mockActivities = [
          { id: "1", activityName: "Dinner" },
          { id: "2", activityName: "City Tour" },
        ];
        apollo.query.mockResolvedValue({
          data: { activityBookingsByFlightId: mockActivities }, 
        });

        const result = await fetchActivityBookingByFlight(10);
        expect(result).toEqual(mockActivities);
        expect(apollo.query).toHaveBeenCalledWith({
          query: expect.any(Object),
          variables: { flightBookingId: 10 },
          fetchPolicy: "network-only",
        });
    });

  //Fetch activity by user
    it("fetchActivityBookingsByUser returns activities for a user", async () => {
        const mockActivities = [
          { id: "1", activityName: "Dinner" },
          { id: "2", activityName: "City Tour" },
        ];

        apollo.query.mockResolvedValue({
          data: { activityBookingsByUser: mockActivities },
        });

        const result = await fetchActivityBookingsByUser();
        expect(result).toEqual(mockActivities);
        expect(apollo.query).toHaveBeenCalledWith({
          query: expect.any(Object),
          fetchPolicy: "network-only",
        });
    });

  //Create a new activity
    it("createActivityBooking returns newly created activity", async () => {
        const newActivity = {
          id: "3",
          activityName: "Lunch",
          activityDateTime: "2025-09-17T10:00:00Z",
          locationCityId: 5,
          numberOfPeople: 2,
          category: "Food",
          activityUrl: "http://example.com",
          totalPrice: 50,
          flightBookingId: 1,
        };

        apollo.mutate.mockResolvedValue({
          data: { createActivityBooking: newActivity },
        });

        const result = await createActivityBooking(
          "2025-09-17T10:00:00Z",
          5,
          2,
          "Food",
          "Lunch",
          "http://example.com",
          50,
          1
        );

        expect(result).toEqual(newActivity);
        expect(apollo.mutate).toHaveBeenCalledWith({
          mutation: expect.any(Object),
          variables: expect.any(Object),
        });
    });

  //Update an activity 
    it("updateActivityBooking returns updated activity", async () => {
          const updatedActivity = { id: "1", numberOfPeople: 3, totalPrice: 60 };

          apollo.mutate.mockResolvedValue({
            data: { updateActivityBooking: updatedActivity },
          });

          const result = await updateActivityBooking(1, 3, 60);
          expect(result).toEqual(updatedActivity);
          expect(apollo.mutate).toHaveBeenCalledWith({
            mutation: expect.any(Object),
            variables: { id: 1, numberOfPeople: 3, totalPrice: 60 },
          });
    });

  //Delete an activity
    it("deleteActivityBooking returns deleted activity", async () => {
        const deletedActivity = { id: "1" };

        apollo.mutate.mockResolvedValue({
          data: { deleteActivityBooking: deletedActivity },
        });

        const result = await deleteActivityBooking(1);
        expect(result).toEqual(deletedActivity);
        expect(apollo.mutate).toHaveBeenCalledWith({
          mutation: expect.any(Object),
          variables: { id: 1 },
        });
    });

})