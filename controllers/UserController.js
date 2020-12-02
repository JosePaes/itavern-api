const { User } = require('../models');
const user = require('../models/user');
const brcrypt = require('bcrypt');
const userService = require('../utils/userService');
const { Op } = require('sequelize');
const e = require('express');

module.exports = {

    list: async (req, res) => {
        const result = await User.findAll({ attributes: { exclude: ['password'] } });

        res.status(200).send(result);
    },

    searchByParam: async (req, res) => {
        const param  = req.body;
        
        try {
            const result = await User.findAll({ where: param });
            if (result.length == 0) {
                return res.status(400).send({ message: "Não foi encontrado nenhum usuario com o parâmetro fornecido" });
            } else {
                return res.status(200).send(result);
            }
        } catch (error) {
            if(error.name == "SequelizeDatabaseError"){
                return res.status(400).send({message: "Verifique se o parâmetro digitado é válido."})
            }
            return res.status(400).send(error.message);
        }
    },

    store: async (req, res) => {

        const user = req.body;
        userService.setBirthDateToISOString(user, user.birthdate);

        try {
            await User.create(user);
            return res.status(201).send({ user });
        } catch (error) {
            return res.status(400).send(error.message);
        }

    },
    delete: async (req, res) => {

        const { id } = req.params;
        const user = await User.findByPk(id)

        if (!user) {
            return res.status(400).send({ message: `Usuário de id ${id} não foi encontrado.` });
        }

        try {
            await User.destroy({ where: { id } });
            return res.status(200).send(user);
        } catch (error) {
            return res.status(400).send(error.message);
        }
    },

    updateById: async (req, res) => {

        const { id } = req.params;
        const changes = req.body;


        const user = await User.findByPk(id);

        if (!user) {
            return res.status(400).send({ message: `Usuário de id ${id} não foi encontrado.` });
        }

        try {
            const result = await User.update(changes, { where: { id } })
            return res.status(200).send({ message: `O usuário de id: ${id} teve as seguintes alterações:`, changes });

        } catch (error) {
            return res.status(400).send(error.message);
        }
    }
}