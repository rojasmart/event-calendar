import { useState } from "react";

import PropTypes from "prop-types";

import { addDays, subDays } from "date-fns";

import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isToday,
  startOfMonth,
} from "date-fns";

import { useMemo } from "react";

import { Container, Text, Grid, Box } from "@chakra-ui/react";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const events = [
  { date: subDays(new Date(), 6), title: "Post video" },
  { date: subDays(new Date(), 1), title: "Edit video" },
  { date: addDays(new Date(), 3), title: "Code" },
];

const EventCalendar = () => {
  const currentDate = new Date();

  const [selectedDate, setSelectedDate] = useState(null);

  const firstDayOfMonth = startOfMonth(currentDate);

  const lastDayOfMonth = endOfMonth(currentDate);

  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  const startingDayIndex = getDay(firstDayOfMonth);

  const eventsByDate = useMemo(() => {
    if (!events) {
      return {};
    }

    return events.reduce((acc, event) => {
      const dateKey = format(event.date, "yyyy-MM-dd");

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }

      acc[dateKey].push(event);

      return acc;
    }, {});
  }, [events]);

  return (
    <Container maxW="100%">
      <div className="mb-4">
        <Text fontSize={"xl"} textAlign={"center"}>
          {format(currentDate, "MMMM yyyy")}
        </Text>
      </div>

      <Grid templateColumns="repeat(7, 1fr)" gap={6}>
        {WEEKDAYS.map((day) => {
          return <Text key={day}>{day}</Text>;
        })}

        {Array.from({ length: startingDayIndex }).map((_, index) => {
          return (
            <Box
              key={`empty-${index}`}
              border="1px"
              borderRadius="md"
              p={2}
              textAlign="center"
            />
          );
        })}

        {daysInMonth.map((day, index) => {
          const dateKey = format(day, "yyyy-MM-dd");

          const todaysEvents = eventsByDate[dateKey] || [];

          return (
            <Box
              key={index}
              border="1px"
              borderRadius="md"
              p={2}
              textAlign="center"
              bg={isToday(day) ? "gray.200" : undefined}
              color={isToday(day) ? "gray.900" : undefined}
              onClick={() => setSelectedDate(day)}
              cursor={"pointer"}
              _hover={{ bg: "blue.300" }}
              minH="110px"
            >
              {format(day, "d")}

              {todaysEvents.map((event) => {
                return (
                  <Box
                    key={event.title}
                    bg="green.500"
                    borderRadius="md"
                    color="gray.900"
                  >
                    {event.title}
                  </Box>
                );
              })}
            </Box>
          );
        })}
      </Grid>
    </Container>
  );
};

export default EventCalendar;

EventCalendar.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.instanceOf(Date),

      title: PropTypes.string,
    })
  ),
};
