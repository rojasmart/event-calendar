import { useState } from "react";

import PropTypes from "prop-types";

import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isToday,
  startOfMonth,
  addDays,
  subDays,
  addMonths,
  subMonths,
} from "date-fns";

import { useMemo } from "react";

import {
  Container,
  Text,
  Grid,
  Box,
  ButtonGroup,
  Button,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const EVENT_CATEGORIES = ["Ticket", "Sala", "Estacionamento"];
const CATEGORY_COLORS = {
  Ticket: "green.300",
  Sala: "blue.300",
  Estacionamento: "yellow.300",
};

const EventCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newEventCategory, setNewEventCategory] = useState("");
  const [events, setEvents] = useState([
    { date: subDays(new Date(), 6), title: "Post video" },
    { date: subDays(new Date(), 1), title: "Edit video" },
    { date: addDays(new Date(), 3), title: "Code" },
  ]);

  const [selectedDate, setSelectedDate] = useState(null);

  // Add a new state variable for the selected category
  const [selectedCategory, setSelectedCategory] = useState("");

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);

  const [eventToEdit, setEventToEdit] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenEdit,
    onOpen: onOpenEdit,
    onClose: onCloseEdit,
  } = useDisclosure();

  const [newEventTitle, setNewEventTitle] = useState("");

  // Create functions to go to the next and previous month
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToPrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleBoxClick = () => {
    setNewEventTitle("");
    setNewEventCategory("");
    onOpen();
  };

  const handleSave = () => {
    const newEvent = {
      date: selectedDate,
      title: newEventTitle,
      category: newEventCategory,
    };
    setEvents([...events, newEvent]);
    onClose();
  };

  const handleDelete = (eventToDelete) => {
    setEvents(events.filter((event) => event !== eventToDelete));
  };

  const handleEdit = (event) => {
    setEventToEdit(event);
    setNewEventTitle(event.title);
    setNewEventCategory(event.category);
    onOpenEdit();
  };

  const handleUpdate = () => {
    setEvents(
      events.map((event) =>
        event === eventToEdit
          ? { ...event, title: newEventTitle, category: newEventCategory }
          : event
      )
    );
    onCloseEdit();
  };

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
    <Container maxW="100%" mt={6}>
      <Container maxW={"100%"} p={0}>
        <Flex
          justifyContent="space-between"
          mt={4}
          alignItems={"self-end"}
          gap={4}
        >
          <ButtonGroup mt={4} spacing={4}>
            <Button onClick={goToPrevMonth}>Prev</Button>
            <Text fontSize={"2xl"} textAlign={"center"}>
              {format(currentDate, "MMMM yyyy")}
            </Text>
            <Button onClick={goToNextMonth}>Next</Button>
          </ButtonGroup>
          <Select
            cursor={"pointer"}
            maxW={"200px"}
            placeholder="Todos"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {EVENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </Flex>
      </Container>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Criar Evento</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Título Evento</FormLabel>
              <Input
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Categoria Evento</FormLabel>
              <Select
                placeholder="Select category"
                value={newEventCategory}
                onChange={(e) => setNewEventCategory(e.target.value)}
              >
                {EVENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" onClick={handleSave}>
              Criar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isOpenEdit} onClose={onCloseEdit}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Evento</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Título Evento</FormLabel>
              <Input
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Categoria Evento</FormLabel>
              <Select
                placeholder="Select category"
                value={newEventCategory}
                onChange={(e) => setNewEventCategory(e.target.value)}
              >
                {EVENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleUpdate}>
              Editar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Grid mt={6} templateColumns="repeat(7, 1fr)" gap={1}>
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
              bg={isToday(day) ? "red.200" : undefined}
              color={isToday(day) ? "gray.900" : undefined}
              onClick={() => {
                setSelectedDate(day);
                handleBoxClick();
              }}
              cursor={"pointer"}
              _hover={{ bg: "gray.100" }}
              minH="110px"
            >
              {format(day, "d")}

              {todaysEvents
                .filter(
                  (event) =>
                    !selectedCategory || event.category === selectedCategory
                )
                .map((event) => {
                  return (
                    <Box
                      key={event.title}
                      bg={CATEGORY_COLORS[event.category] || "gray.300"}
                      borderRadius="md"
                      color="gray.900"
                      display={"flex"}
                      justifyContent={"space-between"}
                      p={2}
                      mt={2}
                    >
                      <Text fontSize={"sm"}>{event.title}</Text>
                      <Box display={"flex"} gap={1}>
                        <Button
                          size="xs"
                          colorScheme="blue"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent the box click event from firing
                            handleEdit(event);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="xs"
                          colorScheme="red"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent the box click event from firing
                            handleDelete(event);
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
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
