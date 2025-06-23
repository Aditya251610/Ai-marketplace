import { Web3Storage } from 'web3.storage';

const WEB3_STORAGE_TOKEN = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN || 'BOLTsmgbmtwwms512';

export class IPFSService {
  private client: Web3Storage;

  constructor() {
    this.client = new Web3Storage({ token: WEB3_STORAGE_TOKEN });
  }

  async uploadFile(file: File): Promise<string> {
    try {
      const cid = await this.client.put([file]);
      return cid;
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error('Failed to upload to IPFS');
    }
  }

  async uploadJSON(data: any): Promise<string> {
    try {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const file = new File([blob], 'metadata.json');
      const cid = await this.client.put([file]);
      return cid;
    } catch (error) {
      console.error('IPFS JSON upload error:', error);
      throw new Error('Failed to upload JSON to IPFS');
    }
  }

  getFileUrl(cid: string, filename?: string): string {
    return `https://${cid}.ipfs.w3s.link/${filename || ''}`;
  }
}

export const ipfsService = new IPFSService();