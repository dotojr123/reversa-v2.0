export class UserService {
    constructor(orderService) {
        this.orderService = orderService;
    }

    createUser(name) {
        this.orderService.notify();
        return { name };
    }
}
