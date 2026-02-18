import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';
import 'utils/date_formatter.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await DateFormatter.init();
  runApp(
    const ProviderScope(
      child: BodyCountApp(),
    ),
  );
}
