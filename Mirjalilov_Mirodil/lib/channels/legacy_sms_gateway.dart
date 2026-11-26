class LegacySmsGateway {
// Старый SMS-шлюз его нельзя менять.
  int sendSms(String phone, List<int> payload, int priorityCode) {
    if (phone.isEmpty || payload.isEmpty) {
      print("SMS error: нет номера или текста");
      return 400;
    }
    print("Sending SMS to $phone (priority $priorityCode): ${payload.length} bytes");
    return 200;
  }
}
