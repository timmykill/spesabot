#!/usr/bin/env node

const TelegramBot = require('node-telegram-bot-api');
const token = require('./conf.js').token;
const bot = new TelegramBot(token, {polling: true});

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./test.db', (err) => {
	if (err) {
		console.log('Non ho aperto il db');
		process.exit(1);
	}
});
const schema = 'create table spesa(item text, quantity integer);'

bot.onText(/\/start/, (msg, match) => {
	const chatId = msg.chat.id;
	bot.sendMessage(chatId, 'Bruttissimo bot per gestire la spesa\nDevo finire di leggere SICP e imparare JS\nImplementato su node\n*/help* per la lista di comandi', { parse_mode : 'Markdown'} );
});


bot.onText(/\/help/, (msg, match) => {
	const chatId = msg.chat.id;
	bot.sendMessage(chatId, '*/add* _<oggetto>_ : aggiunge _<oggetto>_ alla lista della spesa\n*/rm* _<oggetto>_ : rimuove _<oggetto>_ dalla lista della spesa\n*/ls* : mostra la lista della spesa\n*/rmn* _<numero>_ : rimuovere oggetto numero _<numero>_ dalla lista\n*/rmall*: elimina tutta la lista della spesa', {parse_mode : 'Markdown'} ); 
});


bot.onText(/\/rm (.+)/, (msg, match) => {
	const chatId = msg.chat.id;
	db.run('delete from spesa where item = \'' + match[1] + '\'');
	bot.sendMessage(chatId, 'Rimosso: ' + match[1]);
});

bot.onText(/\/rmn (.+)/, (msg, match) => {
	const chatId = msg.chat.id;
	let item = '';
	db.all('select * from spesa', [], (err, rows) => {
		let list = 'Lista: \n';
		if (err) {
			throw err;
		}
		let i = 1;
		rows.forEach((row) => {
			if (i++ == match[1])
				item = row.item
		});
		db.run('delete from spesa where item = \'' + item + '\'');
		bot.sendMessage(chatId, 'Rimosso: ' + item);
	});
});

bot.onText(/\/rmall/, (msg, match) => {
	const chatId = msg.chat.id;
	db.run('delete from spesa');
	bot.sendMessage(chatId, 'Eliminata tutta la lista: ');
});

bot.onText(/\/add (.+)/, (msg, match) => {
	const chatId = msg.chat.id;
    const resp = match[1];
	db.run('insert into spesa values (\'' + match[1] + '\', 1)');
	bot.sendMessage(chatId, 'Aggiunto: ' + match[1]);
});

bot.onText(/\/ls/, (msg, match) => {
	const chatId = msg.chat.id;
	db.all('select * from spesa', [], (err, rows) => {
		let list = 'Lista: \n';
		if (err) {
			throw err;
		}
		let i = 1;
		rows.forEach((row) => {
			list = list + i++ + ' - ' + row.item + '\n';
		});
		bot.sendMessage(chatId, list);	
	});
});

/*
bot.on('message', (msg) => {
		const chatId = msg.chat.id;
        bot.sendMessage(chatId, 'gotmsg');
});
*/
