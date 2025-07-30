const Redis = require('ioredis');
const redis = new Redis();


async function newOrder(
	orderId = 0,
	maker = "0x...",
	sourceToken = "0x...",
	sourceAmount = 0,
	destinationToken = "0x...",
	minReturnAmount = 0,
	sourceChainId = 0,
	destinationChainId = 0,
	expirationTimestamp = 0,
	signature = "0x...",
	exchangeQuote = 0,
	dutchStartTime = 0
) {
	const order = {
		id: orderId,
		maker,
		sourceToken,
		sourceAmount,
		destinationToken,
		minReturnAmount,
		sourceChainId,
		destinationChainId,
		expirationTimestamp,
		signature,
		exchangeQuote,
		dutchStartTime
	};
	await storeTempOrder(order, "temporary");
}

async function storeTempOrder(orderId, orderData) {
	const key = `unverified:order:${orderId}`;
	await redis.setex(key, 30, JSON.stringify(orderData)); // 30s TTL
}

async function storeVerifiedOrder(orderId) {
	const tempKey = `unverified:order:${orderId}`;
	const rawOrder = await redis.get(tempKey);
	if (!rawOrder) return console.log("Order expired or invalid");
  
	const order = JSON.parse(rawOrder);
  
	await redis.multi()
	  .del(tempKey)
	  .hset("orders:map", orderId, JSON.stringify(order))
	  .lpush("orders:active", orderId)
	  .publish("orders:verified", orderId)
	  .exec();
  
	console.log("Order stored:", orderId);
}

async function getAllOrders() {
	const orderIds = await redis.lrange("orders:active", 0, -1);
	if (!orderIds.length) return [];
  
	const rawOrders = await redis.hmget("orders:map", ...orderIds);
  
	const parsed = rawOrders.map((raw, i) => ({
	  id: orderIds[i],
	  ...JSON.parse(raw),
	}));
  
	return parsed;
  }
  
async function removeOrder(orderId) {
	const rawOrder = await redis.hget("orders:map", orderId);
	if (!rawOrder) return console.log("Already taken or not found");
  
	await redis.multi()
	  .hdel("orders:map", orderId)
	  .lrem("orders:active", 0, orderId)
	  .publish("orders:taken", orderId)
	  .exec();
  
	console.log("Order taken:", orderId);
}

async function updateOrder(orderId, updates) {
	const raw = await redis.hget("orders:map", orderId);
	if (!raw) return console.log("Order not found");
  
	const order = JSON.parse(raw);
	Object.assign(order, updates);
  
	await redis.multi()
	  .hset("orders:map", orderId, JSON.stringify(order))
	  .publish("orders:updated", orderId)
	  .exec();
  
	console.log("Order updated:", orderId);
  }
  
  
module.exports = {
	newOrder,
	storeVerifiedOrder,
	removeOrder,
	updateOrder,
	getAllOrders
};