import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import { pt } from "date-fns/locale";

import {
  isSameDay,
  startOfWeek,
  endOfWeek,
  endOfMonth,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  addDays,
  subDays,
  addMonths,
  subMonths,
} from "date-fns";

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
  CardBody,
  Card,
  IconButton,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { useMemo } from "react";

import { CloseIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const EVENT_CATEGORIES = ["Feriado", "Reserva de Sala", "Reserva de Automóvel"];

const CATEGORY_COLORS = {
  Feriado: "green.300",
  "Reserva de Sala": "red.300",
  "Reserva de Automóvel": "yellow.300",
};

const EventCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const newEventTitleRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [dailyEvents, setDailyEvents] = useState([]);

  const [selectedDate, setSelectedDate] = useState(null);

  const [view, setView] = useState("monthly"); // add view "monthly", "weekly", "daily"

  // Add a new state variable for the selected category
  const [selectedCategory, setSelectedCategory] = useState("");

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const startOfWeekDate = startOfWeek(currentDate);
  const endOfWeekDate = endOfWeek(currentDate);

  const [eventToEdit, setEventToEdit] = useState(null);

  const [newEventDataInicio, setNewEventDataInicio] = useState(eventToEdit?.dataInicio || "");
  const [newEventDataFim, setNewEventDataFim] = useState(eventToEdit?.dataFim || "");

  //Categorias
  const [newEventCategory, setNewEventCategory] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  //Modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure();

  const [newEventTitle, setNewEventTitle] = useState("");

  /*   useEffect(() => {
    if (calendarios) {
      const mappedEvents = calendarios.map((calendario) => ({
        id: calendario.id,
        dataInicio: new Date(calendario.dataInicio),
        dataFim: new Date(calendario.dataFim),
        title: calendario.descricao,
        category: calendario.calendarioTipo,
        diaInteiro: calendario.diaInteiro,
      }));

      setEvents(mappedEvents);
    }
  }, [calendarios]); */

  const renderHeader = () => {
    if (view === "monthly") {
      return format(currentDate, "MMMM yyyy", { locale: pt });
    } else if (view === "weekly") {
      return `${format(startOfWeekDate, "dd MMM")} - ${format(endOfWeekDate, "dd MMM yyyy")}`;
    } else if (view === "daily") {
      return format(currentDate, "dd MMM yyyy");
    }
  };

  // Pré-processa eventos agrupados por data para evitar cálculos repetitivos
  const preprocessedEvents = useMemo(() => {
    return events.reduce((acc, event) => {
      const dateKey = format(new Date(event.dataInicio), "yyyy-MM-dd");
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(event);
      return acc;
    }, {});
  }, [events]);

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const monthDate = new Date(currentDate.getFullYear(), i, 1);
        return {
          monthDate,
          label: format(monthDate, "MMMM", { locale: pt }),
        };
      }),
    [currentDate]
  );

  const eventsByDate = useMemo(() => {
    if (!events) {
      return {};
    }

    return events.reduce((acc, event) => {
      // Check if dataInicio is a valid date
      const isValidDataInicio = event.dataInicio && !isNaN(new Date(event.dataInicio).getTime());
      const isValidDataFim = event.dataFim && !isNaN(new Date(event.dataFim).getTime());

      if (!isValidDataInicio) {
        console.error("Invalid dataInicio value:", event.dataInicio);
        return acc; // Skip this event
      }

      const dateKey = format(new Date(event.dataInicio), "yyyy-MM-dd");

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }

      // Optionally format dataFim if it exists and is valid
      if (isValidDataFim) {
        event.dataFim = format(new Date(event.dataFim), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
      }

      acc[dateKey].push(event);

      return acc;
    }, {});
  }, [events]);

  const goToNext = () => {
    if (view === "monthly") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === "weekly") {
      setCurrentDate(addDays(currentDate, 7));
    } else if (view === "daily") {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const goToPrev = () => {
    if (view === "monthly") {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (view === "weekly") {
      setCurrentDate(subDays(currentDate, 7));
    } else if (view === "daily") {
      setCurrentDate(subDays(currentDate, 1));
    }
  };

  const generateHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(`${i.toString().padStart(2, "0")}:00`);
    }
    return hours;
  };

  const handleBoxClick = () => {
    setNewEventTitle("");
    setNewEventCategory("");
    onOpen();
  };

  const handleSave = () => {
    const title = newEventTitleRef.current?.value;
    if (!title) return;
    const isHoliday = newEventCategory === "Feriado";

    const startDate = isHoliday
      ? new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()))
      : new Date(
          Date.UTC(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            parseInt(startTime.split(":")[0], 10),
            parseInt(startTime.split(":")[1], 10)
          )
        );
    const endDate = isHoliday
      ? new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()))
      : new Date(
          Date.UTC(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            parseInt(endTime.split(":")[0], 10),
            parseInt(endTime.split(":")[1], 10)
          )
        );

    const newEvent = {
      title,
      category: newEventCategory,
      dataInicio: startDate,
      dataFim: endDate,
      diaInteiro: isHoliday,
    };

    const postCalendariosEvent = {
      dataInicio: newEvent.dataInicio.toISOString(),
      dataFim: newEvent.dataFim.toISOString(),
      descricao: newEvent.title,
      calendarioTipoId: EVENT_CATEGORIES.findIndex((category) => category === newEvent.category) + 1,
      diaInteiro: isHoliday,
    };

    //postCalendarios(postCalendariosEvent);
    setEvents([...events, newEvent]);
    onClose();
  };

  const handleDelete = (eventToDelete) => {
    setEvents(events.filter((event) => event !== eventToDelete));
    //deleteCalendarios(eventToDelete.id);
  };

  const handleEdit = (event) => {
    setEventToEdit(event);
    setNewEventTitle(newEventTitleRef.current?.value);
    setNewEventCategory(event.category);
    onOpenEdit();
  };

  const handleUpdate = () => {
    const updatedTitle = newEventTitleRef.current?.value;
    if (!updatedTitle) return;
    const updatedEvent = {
      id: eventToEdit.id,
      descricao: updatedTitle,
      calendarioTipoId: EVENT_CATEGORIES.findIndex((category) => category === newEventCategory) + 1,
      dataInicio: eventToEdit.dataInicio,
      dataFim: eventToEdit.dataFim,
    };

    if (newEventDataInicio && newEventDataInicio !== eventToEdit.dataInicio) {
      updatedEvent.dataInicio = newEventDataInicio;
    }

    if (newEventDataFim && newEventDataFim !== eventToEdit.dataFim) {
      updatedEvent.dataFim = newEventDataFim;
    }

    //putCalendarios(eventToEdit.id, updatedEvent);
    onCloseEdit();
  };

  const renderMonthlyView = () => {
    const startDate = startOfWeek(firstDayOfMonth);
    const endDate = endOfWeek(lastDayOfMonth);
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return (
      <Grid templateColumns="repeat(7, 1fr)" gap={1} width="100%" height="100%">
        {WEEKDAYS.map((day) => {
          return (
            <Button size="sm" backgroundColor={"gray.100"} key={day}>
              {day}
            </Button>
          );
        })}
        {days.map((day, index) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const todaysEvents = eventsByDate[dateKey] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <Box
              key={index}
              border="1px"
              borderRadius="md"
              borderColor={"gray.200"}
              p={2}
              textAlign="center"
              onClick={() => {
                setSelectedDate(day);
                handleBoxClick();
              }}
              cursor={"pointer"}
              _hover={{ bg: "gray.100" }}
              minH="150px"
              backgroundColor={isCurrentMonth ? "white" : "gray.200"}
            >
              <Box
                width="30px"
                height="30px"
                borderRadius="50%"
                display="flex"
                fontSize="sm"
                fontWeight={isToday(day) ? "bold" : "normal"}
                alignItems="center"
                justifyContent="center"
                borderColor={isToday(day) ? "white" : "gray.100"}
                backgroundColor={isToday(day) ? "pink" : "gray.100"}
                color={isCurrentMonth ? "black" : "gray.500"}
              >
                {format(day, "d")}
              </Box>

              {todaysEvents
                .filter((event) => !selectedCategory || event.category === selectedCategory)
                .map((event) => {
                  return (
                    <Box
                      key={event.title}
                      bg={CATEGORY_COLORS[event.category] || "gray.300"}
                      borderRadius="md"
                      color="gray.900"
                      display={"flex"}
                      justifyContent={"space-between"}
                      p={1}
                      mt={2}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(event);
                      }}
                      alignItems={"center"}
                    >
                      <Text as={"b"} fontSize={"xs"}>
                        {event.title}
                      </Text>
                      <Box display={"flex"} gap={1}>
                        <IconButton
                          size="xs"
                          colorScheme="red"
                          aria-label="Delete event"
                          icon={<CloseIcon />}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent the box click event from firing
                            handleDelete(event);
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
            </Box>
          );
        })}
      </Grid>
    );
  };

  const checkIfEventMarked = (day) => {
    return events.some((event) => isSameDay(event.date, day));
  };

  const renderWeeklyView = () => {
    const hoursInDay = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const startDate = startOfWeek(currentDate);
    const endDate = endOfWeek(currentDate);
    const daysInWeek = [];

    let day = startDate;

    while (day <= endDate) {
      daysInWeek.push(day);
      day = addDays(day, 1);
    }

    return (
      <Grid templateColumns="50px repeat(7, 1fr)" gap={1} width="100%" height="100%">
        <Box>
          <Button visibility="hidden" />
          <Box flex="1" border="1px" backgroundColor="gray.100" borderRadius="md" borderColor="gray.200" position="relative">
            {hoursInDay.map((hour) => (
              <Box
                key={hour}
                borderBottom="1px"
                borderColor="gray.200"
                p={1}
                height="40px"
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <Text fontSize="xs">{hour}</Text>
              </Box>
            ))}
          </Box>
        </Box>
        {daysInWeek.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const todaysEvents = events.filter((event) => isSameDay(event.dataInicio, day));

          return (
            <Box
              key={dateKey}
              borderColor={"gray.200"}
              textAlign="center"
              cursor={"pointer"}
              display="flex"
              flexDirection="column"
              position="relative"
            >
              <Button
                size="sm"
                width="100%"
                display="flex"
                fontSize="sm"
                alignItems="center"
                justifyContent="center"
                borderColor={isToday(day) ? "white" : "gray.100"}
                backgroundColor={isToday(day) ? "pink" : "gray.100"}
              >
                {format(day, "dd MMM yyyy")}
              </Button>
              <Box flex="1" mt={2} border="1px" borderColor="gray.200" position="relative" borderRadius={"md"}>
                {todaysEvents.map((event) => {
                  const eventStartTime = new Date(event.dataInicio);
                  const eventEndTime = new Date(event.dataFim);
                  const startHour = eventStartTime.getHours();
                  const startMinutes = eventStartTime.getMinutes();
                  const endHour = eventEndTime.getHours();
                  const endMinutes = eventEndTime.getMinutes();
                  const isSpecialEvent = event.category === "Reserva de Sala" || event.category === "Reserva de Automóvel";
                  const isHoliday = event.category === "Feriado";
                  const isMarked = checkIfEventMarked(event);

                  const topPosition = (startHour * 60 + startMinutes) * (40 / 60); // Ajuste aqui
                  const eventDuration = (endHour * 60 + endMinutes - (startHour * 60 + startMinutes)) * (40 / 60); // Ajuste aqui

                  return (
                    <Box
                      key={event.title}
                      position="absolute"
                      top={isHoliday ? "0" : `${topPosition}px`}
                      left="0"
                      right="0"
                      height={isHoliday ? "100%" : `${eventDuration}px`}
                      backgroundColor={CATEGORY_COLORS[event.category] || "gray.300"}
                      zIndex="3"
                      display="flex"
                      textAlign={"left"}
                      flexDirection={"column"}
                      p={1}
                      border={isMarked ? "2px solid blue" : "none"} // Exemplo de como destacar eventos marcados
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(event);
                      }}
                    >
                      <Text fontSize="xs" fontWeight="bold" color="black">
                        {event.title}
                      </Text>
                      <Text fontSize="xs" color="black">
                        {isSpecialEvent && `${format(eventStartTime, "HH:mm")} - ${format(eventEndTime, "HH:mm")}`}
                      </Text>
                      <Box display="flex" justifyContent="space-between" mt={1} position="relative">
                        <IconButton
                          size="xs"
                          colorScheme="red"
                          aria-label="Delete event"
                          icon={<CloseIcon />}
                          position="absolute"
                          top="-20px"
                          right="0"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent the box click event from firing
                            handleDelete(event);
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
                {hoursInDay.map((hour) => (
                  <Box
                    key={hour}
                    borderBottom="1px"
                    borderColor="gray.200"
                    p={1}
                    height="40px"
                    onClick={() => {
                      setSelectedDate(day);
                      handleBoxClick();
                    }}
                    position="relative"
                    zIndex="2"
                  >
                    {/* Empty cells */}
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
      </Grid>
    );
  };

  const renderDailyView = (dayEvents) => {
    const HOUR_HEIGHT = 42; // Altura em pixels por hora

    return generateHours().map((hour) => (
      <Box
        key={hour}
        position="relative"
        p={2}
        minH="20px"
        w="100%"
        bg={
          dayEvents.some(
            (event) =>
              format(new Date(event.dataInicio).getTime() - new Date(event.dataInicio).getTimezoneOffset() * 60000, "HH:00") === hour &&
              event.tituloReferencia
          )
            ? "gray.200"
            : "transparent"
        }
        display="flex"
        alignItems="center"
        _after={{
          content: '""',
          position: "absolute",
          top: "50%",
          left: 20,
          right: 0,
          height: "1px",
          backgroundColor: "gray.200",
          transform: "translateY(-50%)",
        }}
        onClick={() => {
          handleBoxClick();
        }}
      >
        <Box w="10%">
          <Text fontSize="xs">{hour}</Text>
        </Box>
        <Box w="90%" display="grid" gridTemplateColumns="repeat(auto-fill, minmax(100px, 1fr))" gap={2} position="relative">
          {dayEvents
            .filter((event) => {
              const localStart = new Date(event.dataInicio).getTime() - new Date(event.dataInicio).getTimezoneOffset() * 60000;
              return format(localStart, "HH:00") === hour || format(localStart, "HH") === hour.split(":")[0];
            })
            .map((event) => {
              const start = new Date(event.dataInicio).getTime() - new Date(event.dataInicio).getTimezoneOffset() * 60000;
              const end = new Date(event.dataFim).getTime() - new Date(event.dataFim).getTimezoneOffset() * 60000;
              const duration = (end - start) / (1000 * 60); // Duração em minutos
              const height = (duration / 60) * HOUR_HEIGHT; // Altura em pixels, assumindo HOUR_HEIGHT por hora

              const startHour = new Date(start).setMinutes(0, 0, 0);
              const topOffset = ((start - startHour) / (1000 * 60)) * (HOUR_HEIGHT / 60); // Posição top em pixels

              const startFormatted = format(start, "HH:mm");
              const endFormatted = format(end, "HH:mm");

              return (
                <Box
                  key={event.id}
                  bg={CATEGORY_COLORS[event.category] || "gray.300"}
                  color="gray.900"
                  p={2}
                  position="absolute"
                  top={`${topOffset}px`}
                  height={`${height}px`}
                  width="100%"
                  zIndex={2}
                  display={"flex"}
                  flexDirection={"column"}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the box click event from firing
                    handleEdit(event);
                  }}
                >
                  <Box display="flex" justifyContent="space-between" mt={1} position="relative">
                    <IconButton
                      size="xs"
                      colorScheme="red"
                      aria-label="Delete event"
                      icon={<CloseIcon />}
                      position="absolute"
                      top="0"
                      right="0"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the box click event from firing
                        handleDelete(event);
                      }}
                    />
                  </Box>
                  <Text as={"b"} fontSize={"sm"} cursor={"pointer"}>
                    {event.title}
                  </Text>
                  <Text fontSize="xs">{`${startFormatted} - ${endFormatted}`}</Text>
                </Box>
              );
            })}
        </Box>
      </Box>
    ));
  };

  const renderYearlyView = () => {
    return (
      <Grid templateColumns="repeat(3, 1fr)" gap={4} mt={4}>
        {months.map(({ monthDate, label }) => {
          const startDate = startOfWeek(startOfMonth(monthDate));
          const endDate = endOfWeek(endOfMonth(monthDate));
          const days = [];
          let day = startDate;

          while (day <= endDate) {
            days.push(day);
            day = addDays(day, 1);
          }

          return (
            <Box key={label} border="1px" borderColor="gray.200" borderRadius="md" p={4} bg="white" boxShadow="sm">
              <Text fontSize="md" fontWeight="bold" mb={2} backgroundColor={"gray.100"} textAlign="left" p={1}>
                {label}
              </Text>
              <Grid templateColumns="repeat(7, 1fr)" gap={1}>
                {WEEKDAYS.map((day) => (
                  <Text key={day} fontSize="xs" fontWeight="bold" textAlign="center">
                    {day}
                  </Text>
                ))}
                {days.map((day, index) => {
                  const dateKey = format(day, "yyyy-MM-dd");
                  const todaysEvents = preprocessedEvents[dateKey] || [];
                  const isCurrentMonth = isSameMonth(day, monthDate);

                  return (
                    <Box
                      key={index}
                      textAlign="center"
                      p={1}
                      borderRadius="md"
                      cursor={isCurrentMonth ? "pointer" : "default"}
                      bg={isToday(day) ? "pink.200" : isCurrentMonth ? "white" : "gray.100"}
                      color={isCurrentMonth ? "black" : "gray.500"}
                      onClick={() => {
                        if (isCurrentMonth) {
                          setSelectedDate(day);
                          handleBoxClick();
                        }
                      }}
                    >
                      <Text fontSize="xs">{format(day, "d")}</Text>

                      {/* Renderiza os eventos do dia */}
                      {todaysEvents.map((event, idx) => (
                        <Box
                          key={idx}
                          mt={1}
                          bg={CATEGORY_COLORS[event.category] || "gray.300"}
                          borderRadius="md"
                          p={1}
                          fontSize="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(event);
                          }}
                        >
                          {event.title}
                        </Box>
                      ))}
                    </Box>
                  );
                })}
              </Grid>
            </Box>
          );
        })}
      </Grid>
    );
  };

  useEffect(() => {
    if (view === "daily") {
      const dateKey = format(currentDate, "yyyy-MM-dd");
      setDailyEvents(eventsByDate[dateKey] || []);
      setSelectedDate(currentDate);
    }
  }, [view, currentDate, eventsByDate]);

  useEffect(() => {
    if (isOpenEdit && eventToEdit && newEventTitleRef.current) {
      newEventTitleRef.current.value = eventToEdit.title;
    }
  }, [isOpenEdit, eventToEdit]);

  // Function to check if event feriado exists on selected date
  const isHolidayEventExists = (selectedDate, events) => {
    return events.some((event) => isSameDay(event.date, selectedDate) && event.category === "Feriado");
  };

  const holidayExists = isHolidayEventExists(selectedDate, events);

  return (
    <Card>
      <CardBody>
        <Container maxW="100%">
          <Flex justifyContent="space-between" mt={4} alignItems={"self-end"} gap={4}>
            <ButtonGroup spacing={2}>
              <Button size="sm" onClick={() => setCurrentDate(new Date())}>
                Hoje
              </Button>
              <IconButton size="sm" onClick={goToPrev} icon={<ChevronLeftIcon />} />
              <IconButton size="sm" onClick={goToNext} icon={<ChevronRightIcon />} />
              <Text fontSize={"lg"} textAlign={"center"}>
                {renderHeader()}
              </Text>
            </ButtonGroup>
            <HStack spacing={2}>
              <Select cursor="pointer" size="sm" value={view} onChange={(e) => setView(e.target.value)}>
                <option value="monthly">Mês</option>
                <option value="weekly">Semana</option>
                <option value="daily">Dia</option>
                <option value="yearly">Ano</option>
              </Select>
            </HStack>
            <HStack spacing={2}>
              {EVENT_CATEGORIES.map((category) => (
                <Button
                  key={category}
                  backgroundColor={CATEGORY_COLORS[category]}
                  variant="solid"
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  isActive={selectedCategory === category}
                >
                  {category}
                </Button>
              ))}
            </HStack>
          </Flex>

          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Criar Evento</ModalHeader>
              <ModalBody>
                <FormControl>
                  <FormLabel fontSize="sm">Título</FormLabel>
                  <Input size="sm" ref={newEventTitleRef} placeholder="Digite o título do evento" />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    size="sm"
                    cursor={"pointer"}
                    placeholder="Seleccione"
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value)}
                  >
                    {EVENT_CATEGORIES.filter((category) => !holidayExists || category !== "Feriado").map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                  {(newEventCategory === "Reserva de Sala" || newEventCategory === "Reserva de Automóvel") && (
                    <>
                      <FormControl mt={4}>
                        <FormLabel fontSize="sm">Data Início</FormLabel>
                        <Input size="sm" type="time" placeholder="Hora Início" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                      </FormControl>
                      <FormControl mt={4}>
                        <FormLabel fontSize="sm">Data Fim</FormLabel>
                        <Input size="sm" type="time" placeholder="Hora Fim" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                      </FormControl>
                    </>
                  )}
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button size="sm" colorScheme="gray" onClick={onClose} mr="3">
                  Cancelar
                </Button>
                <Button size="sm" colorScheme="green" onClick={handleSave} isDisabled={!newEventTitleRef.current?.value || !newEventCategory}>
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
                  <FormLabel fontSize="sm">Título</FormLabel>
                  <Input size="sm" ref={newEventTitleRef} defaultValue={eventToEdit?.title || ""} placeholder="Digite o título do evento" />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Categoria Evento</FormLabel>
                  <Select placeholder="Seleccione Categoria" value={newEventCategory} onChange={(e) => setNewEventCategory(e.target.value)}>
                    {EVENT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                {eventToEdit?.dataInicio && (
                  <FormControl mt={4}>
                    <FormLabel>Data Início</FormLabel>
                    <Input type="time" value={newEventDataInicio} onChange={(e) => setNewEventDataInicio(e.target.value)} />
                  </FormControl>
                )}
                {eventToEdit?.dataFim && (
                  <FormControl mt={4}>
                    <FormLabel>Data Fim</FormLabel>
                    <Input type="time" value={newEventDataFim} onChange={(e) => setNewEventDataFim(e.target.value)} />
                  </FormControl>
                )}
              </ModalBody>
              <ModalFooter>
                <Button size="sm" colorScheme="blue" onClick={handleUpdate} isDisabled={!newEventTitleRef.current?.value || !newEventCategory}>
                  Editar
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {view === "daily" ? (
            <VStack mt={6} w="100%">
              {renderDailyView(dailyEvents)}
            </VStack>
          ) : view === "weekly" ? (
            <VStack mt={6} w="100%">
              {renderWeeklyView()}
            </VStack>
          ) : view === "monthly" ? (
            <VStack mt={6} w="100%">
              {renderMonthlyView()}
            </VStack>
          ) : (
            <VStack mt={6} w="100%">
              {renderYearlyView()}
            </VStack>
          )}
        </Container>
      </CardBody>
    </Card>
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
