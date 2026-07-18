export class OrderService {
    constructor(userService) {
        this.userService = userService;
    }

    createOrder(amount) {
        return amount + amount * 0.10;
    }

    cancelOrder(orderId) {
        this.userService.notify();
        return orderId;
    }
}
