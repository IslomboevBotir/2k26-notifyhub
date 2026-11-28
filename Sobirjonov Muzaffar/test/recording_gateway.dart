import '../lib/channels/legacy_sms_gateway.dart';

class RecordingGateway extends LegacySmsGateway {
  int? priority;
  List<int>? payload;
  int status = 200;
  @override
  int send_sms(String phone, List<int> payload, int priority_code) {
    priority = priority_code;
    this.payload = payload;
    return status;
  }
}
