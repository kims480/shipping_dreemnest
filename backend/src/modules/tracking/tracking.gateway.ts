import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * Real-time tracking channel (PDR §6/§13, TECH_ARCHITECTURE §5): broadcasts
 * WO stage transitions and DFP location pings to subscribed dashboards
 * (Admin / End Customer / Merchant / DFP) over per-WO and per-zone rooms.
 */
@WebSocketGateway({ cors: { origin: '*' }, namespace: '/tracking' })
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TrackingGateway.name);

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:work-order')
  subscribeToWorkOrder(@ConnectedSocket() client: Socket, @MessageBody() workOrderId: string) {
    client.join(`work-order:${workOrderId}`);
    return { joined: `work-order:${workOrderId}` };
  }

  @SubscribeMessage('subscribe:zone')
  subscribeToZone(@ConnectedSocket() client: Socket, @MessageBody() zoneId: string) {
    client.join(`zone:${zoneId}`);
    return { joined: `zone:${zoneId}` };
  }

  emitStageChanged(workOrderId: string, payload: Record<string, unknown>) {
    this.server.to(`work-order:${workOrderId}`).emit('work-order:stage-changed', payload);
  }

  emitDfpLocation(zoneId: string, payload: Record<string, unknown>) {
    this.server.to(`zone:${zoneId}`).emit('dfp:location', payload);
  }
}
