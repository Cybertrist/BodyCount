import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../screens/lock_screen.dart';
import '../screens/home/dashboard_screen.dart';
import '../screens/contacts/contacts_list_screen.dart';
import '../screens/contacts/contact_detail_screen.dart';
import '../screens/contacts/contact_form_screen.dart';
import '../screens/encounters/encounter_form_screen.dart';
import '../screens/stats/stats_screen.dart';
import '../screens/map/map_screen.dart';
import '../screens/timeline/timeline_screen.dart';
import '../screens/settings/settings_screen.dart';
import '../widgets/common/app_scaffold.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final router = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/home',
  routes: [
    GoRoute(
      path: '/lock',
      builder: (context, state) => const LockScreen(),
    ),
    ShellRoute(
      navigatorKey: _shellNavigatorKey,
      builder: (context, state, child) => AppScaffold(child: child),
      routes: [
        GoRoute(
          path: '/home',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: DashboardScreen(),
          ),
        ),
        GoRoute(
          path: '/contacts',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: ContactsListScreen(),
          ),
        ),
        GoRoute(
          path: '/stats',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: StatsScreen(),
          ),
        ),
        GoRoute(
          path: '/map',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: MapScreen(),
          ),
        ),
      ],
    ),
    GoRoute(
      path: '/contacts/new',
      builder: (context, state) => const ContactFormScreen(),
    ),
    GoRoute(
      path: '/contacts/:id',
      builder: (context, state) {
        final id = int.parse(state.pathParameters['id']!);
        return ContactDetailScreen(contactId: id);
      },
    ),
    GoRoute(
      path: '/contacts/:id/edit',
      builder: (context, state) {
        final id = int.parse(state.pathParameters['id']!);
        return ContactFormScreen(contactId: id);
      },
    ),
    GoRoute(
      path: '/contacts/:id/encounter/new',
      builder: (context, state) {
        final id = int.parse(state.pathParameters['id']!);
        return EncounterFormScreen(contactId: id);
      },
    ),
    GoRoute(
      path: '/timeline',
      builder: (context, state) => const TimelineScreen(),
    ),
    GoRoute(
      path: '/settings',
      builder: (context, state) => const SettingsScreen(),
    ),
  ],
);
