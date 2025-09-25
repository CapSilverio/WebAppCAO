#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# Script temporário para preencher escolhas automaticamente
# NÃO MODIFICAR O CÓDIGO FONTE - APENAS PREENCHE VIA API

import requests
import json
import time
import random

# URL base do servidor
BASE_URL = "http://127.0.0.1:5000"

# Primeiros 41 alunos (classificações 1-41, deixando 42 e MEIRELES-43 para escolha manual)
classificacoes_para_preencher = list(range(1, 42))  # 1 a 41

# IDs das unidades disponíveis (com base no código fonte)
unidades_disponiveis = list(range(1, 40))  # IDs de 1 a 39

def fazer_login_god():
    """Faz login como god"""
    session = requests.Session()

    login_data = {
        'username_or_email': 'god',
        'password': 'godmode'
    }

    response = session.post(f"{BASE_URL}/login",
                           json=login_data,
                           allow_redirects=False)

    if response.status_code == 200:
        try:
            result = response.json()
            if result.get('success'):
                print("Login como god realizado com sucesso")
                return session
            else:
                print(f"Erro no login: {result.get('message', 'Erro desconhecido')}")
                return None
        except:
            print("Erro ao processar resposta do login")
            return None
    else:
        print(f"Erro no login como god. Status: {response.status_code}")
        return None

def obter_unidades_disponiveis(session):
    """Obter lista de unidades com vagas disponíveis"""
    response = session.get(f"{BASE_URL}/api/status")
    if response.status_code == 200:
        try:
            data = response.json()
            unidades_com_vagas = []
            for unidade in data.get('unidades', []):
                if unidade.get('vagas', 0) > 0:
                    unidades_com_vagas.append(unidade['id'])
            return unidades_com_vagas
        except:
            return []
    return []

def resetar_escolhas(session):
    """Resetar todas as escolhas"""
    response = session.post(f"{BASE_URL}/api/reset_choices",
                           headers={'Content-Type': 'application/json'})
    return response.status_code == 200

def fazer_escolha_god(session, unidade_id):
    """God faz uma escolha de unidade"""
    choice_data = {
        'unidade_id': unidade_id
    }

    response = session.post(f"{BASE_URL}/api/choose",
                           json=choice_data,
                           headers={'Content-Type': 'application/json'})

    return response.json() if response.headers.get('content-type', '').startswith('application/json') else None

def main():
    print("Iniciando preenchimento automatico das escolhas...")
    print(f"Preenchendo escolhas para classificacoes 1-41")
    print("Deixando classificacao 42 e MEIRELES (43o) para escolha manual\n")

    # Login como god uma única vez
    session = fazer_login_god()
    if not session:
        print("Nao foi possivel fazer login como god. Abortando.")
        return

    # Resetar escolhas existentes
    print("Resetando escolhas existentes...")
    if resetar_escolhas(session):
        print("Escolhas resetadas com sucesso!")
    else:
        print("Erro ao resetar escolhas, continuando mesmo assim...")

    escolhas_realizadas = 0

    for i, classificacao in enumerate(classificacoes_para_preencher, 1):
        print(f"[{i:2d}/41] Preenchendo classificacao {classificacao}...")

        # Obter unidades com vagas disponíveis em tempo real
        unidades_com_vagas = obter_unidades_disponiveis(session)

        if not unidades_com_vagas:
            print("        ERRO - Nenhuma unidade com vagas disponível")
            continue

        # Escolher uma unidade aleatória que tenha vagas
        unidade_escolhida = random.choice(unidades_com_vagas)

        # God faz a escolha
        resultado = fazer_escolha_god(session, unidade_escolhida)

        if resultado and resultado.get('success'):
            print(f"        OK - Escolheu unidade ID {unidade_escolhida}")
            escolhas_realizadas += 1
        else:
            print(f"        ERRO - {resultado.get('message', 'Erro desconhecido') if resultado else 'Sem resposta'}")

        # Pequena pausa para não sobrecarregar
        time.sleep(0.2)

    print(f"\nPreenchimento concluido!")
    print(f"Escolhas realizadas: {escolhas_realizadas}/41")
    print(f"Classificacao 42 e MEIRELES (43) estao prontos para escolhas manuais!")
    print(f"Este script pode ser deletado apos o uso.")

if __name__ == "__main__":
    main()