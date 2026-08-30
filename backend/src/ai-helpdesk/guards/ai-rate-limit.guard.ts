import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

interface RateLimitBucket {
  timestamps: number[];
}

@Injectable()
export class AiRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(AiRateLimitGuard.name);
  private readonly userBuckets = new Map<string, RateLimitBucket>();
  private readonly WINDOW_MS = 60 * 1000; // 1 minute window
  private readonly MAX_REQUESTS = 20; // 20 requests per minute

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      // If user context is somehow missing, deny request
      throw new HttpException(
        'Authentication required to access AI Student Helpdesk.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const userId = user.id;
    const now = Date.now();

    // Clean up or initialize bucket
    let bucket = this.userBuckets.get(userId);
    if (!bucket) {
      bucket = { timestamps: [] };
      this.userBuckets.set(userId, bucket);
    }

    // Filter out timestamps older than the sliding window
    bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < this.WINDOW_MS);

    if (bucket.timestamps.length >= this.MAX_REQUESTS) {
      const oldestTimestamp = bucket.timestamps[0];
      const retryAfterSeconds = Math.ceil((this.WINDOW_MS - (now - oldestTimestamp)) / 1000);

      this.logger.warn(
        `AI Rate limit exceeded for user ${userId} (${user.erpId || user.username}). Request count: ${bucket.timestamps.length}`,
      );

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: `AI Helpdesk query rate limit exceeded. Please wait ${retryAfterSeconds} seconds before submitting another request.`,
          retryAfter: retryAfterSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Record request timestamp
    bucket.timestamps.push(now);
    return true;
  }
}
