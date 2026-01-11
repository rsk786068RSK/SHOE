
import { SaleRecord, CompanyInfo } from '../types';

export class PrinterService {
  // Use 'any' as 'BluetoothDevice' and 'USBDevice' are not available in standard TypeScript libs
  private static bluetoothDevice: any | null = null;
  private static usbDevice: any | null = null;

  static async connectBluetooth(): Promise<string> {
    try {
      // Cast 'navigator' to 'any' to access 'bluetooth' property
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });
      this.bluetoothDevice = device;
      return device.name || 'BT Printer';
    } catch (error) {
      console.error('Bluetooth connection failed:', error);
      throw new Error('Could not find Bluetooth printer.');
    }
  }

  static async connectUSB(): Promise<string> {
    try {
      // Cast 'navigator' to 'any' to access 'usb' property
      const device = await (navigator as any).usb.requestDevice({ filters: [] });
      await device.open();
      if (device.configuration === null) await device.selectConfiguration(1);
      await device.claimInterface(0);
      this.usbDevice = device;
      return device.productName || 'USB Printer';
    } catch (error) {
      console.error('USB connection failed:', error);
      throw new Error('Could not find USB printer.');
    }
  }

  static async printRaw(data: Uint8Array) {
    if (this.bluetoothDevice) {
      const server = await this.bluetoothDevice.gatt?.connect();
      const service = await server?.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const characteristic = await service?.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');
      await characteristic?.writeValue(data);
    } else if (this.usbDevice) {
      await this.usbDevice.transferOut(1, data);
    } else {
      throw new Error('No printer connected. Please pair a Bluetooth or USB device.');
    }
  }

  static generateEscPos(sale: SaleRecord, company: CompanyInfo, currencySymbol: string): Uint8Array {
    const encoder = new TextEncoder();
    const esc = [0x1B];
    const gs = [0x1D];
    
    // Simple ESC/POS Command sequences
    const initialize = new Uint8Array([...esc, 0x40]);
    const center = new Uint8Array([...esc, 0x61, 0x01]);
    const left = new Uint8Array([...esc, 0x61, 0x00]);
    const boldOn = new Uint8Array([...esc, 0x45, 0x01]);
    const boldOff = new Uint8Array([...esc, 0x45, 0x00]);
    const cut = new Uint8Array([...gs, 0x56, 0x41, 0x00]);

    let text = `${company.name}\n`;
    text += `${company.address}\n`;
    text += `Tel: ${company.phone}\n`;
    text += `--------------------------------\n`;
    text += `Bill: ${sale.id.slice(-6)}  ${new Date().toLocaleDateString()}\n`;
    text += `--------------------------------\n`;
    text += `${sale.shoeName}\n`;
    text += `${sale.variant.color} / Sz: ${sale.variant.size}\n`;
    text += `${sale.quantity} x ${currencySymbol}${sale.totalPrice / sale.quantity} = ${currencySymbol}${sale.totalPrice}\n`;
    text += `--------------------------------\n`;
    text += `TOTAL: ${currencySymbol}${sale.totalPrice}\n`;
    text += `--------------------------------\n`;
    text += `Thank you for shopping!\n\n\n`;

    const body = encoder.encode(text);
    const combined = new Uint8Array(
      initialize.length + center.length + body.length + cut.length
    );
    
    combined.set(initialize, 0);
    combined.set(center, initialize.length);
    combined.set(body, initialize.length + center.length);
    combined.set(cut, initialize.length + center.length + body.length);

    return combined;
  }
}
