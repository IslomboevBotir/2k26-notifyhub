enum NotificationType {
  alert(1),
  reminder(2),
  promo(3);

  const NotificationType(this.priorityCode);
  final int priorityCode;
}
