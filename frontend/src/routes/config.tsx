import { AllEventsPage } from '../pages/AllEventsPage';
import { MyEventsPage } from '../pages/MyEventsPage';
import { RegisteredEventsPage } from '../pages/RegisteredEventsPage';
import { CalendarPage } from '../pages/CalendarPage';
import { CreateEventPage } from '../pages/CreateEventPage';
import { ProfilePage } from '../pages/ProfilePage';

export const ROUTES = {
    HOME: '/',
    MY_EVENTS: '/my-events',
    REGISTERED: '/registered',
    CALENDAR: '/calendar',
    CREATE: '/create',
    PROFILE: '/profile',
    LOGIN: '/login',
    REGISTER: '/register',
};

export const protectedRoutes = [
    { path: ROUTES.HOME, component: AllEventsPage },
    { path: ROUTES.MY_EVENTS, component: MyEventsPage },
    { path: ROUTES.REGISTERED, component: RegisteredEventsPage },
    { path: ROUTES.CALENDAR, component: CalendarPage },
    { path: ROUTES.CREATE, component: CreateEventPage },
    { path: ROUTES.PROFILE, component: ProfilePage },
];