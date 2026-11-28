class SendResult {
  const SendResult(this.total, this.sent);
  final int total;
  final int sent;
  int get failed => total - sent;
  @override
  String toString() => 'Yuborildi: $total tadan $sent tasi. Xatolar: $failed.';
}
