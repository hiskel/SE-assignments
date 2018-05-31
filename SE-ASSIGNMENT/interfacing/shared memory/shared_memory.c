#include <sys/types.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#define KEY 8888
#define SIZE 110
#define SERVERS_TURN '#'
#define CLIENTS_TURN '*'
#define MSG_LEN 100

typedef enum type {SERVER, CLIENT, INVALID } user_type;

void print_msg(char *);
void routine(char *, char, char);
void readline(char *, int);
void write_and_flush(char, char *, char*);
user_type validate(int, char *[]);


void main(int argc, char *argv[]) {
	user_type user = validate(argc, argv);
	if (user == INVALID) exit(1);

	int handle;
	char *shm;
	if ((handle = shmget(KEY, SIZE * sizeof(char), IPC_CREAT | 0666)) != -1) {
		if ((shm = shmat(handle, NULL, 0)) != (char *) -1) {
			// the server gets to start the chat
			*shm = SERVERS_TURN;
			*(shm + 1) = '\0';

			if (user == SERVER) {
				printf("started as server\n");
				routine(shm, SERVERS_TURN, CLIENTS_TURN);
			}
			else {
				printf("started as client\n");
				routine(shm, CLIENTS_TURN, SERVERS_TURN);
			}

			shmdt(shm);						// cleanup work
			shmctl(handle, IPC_RMID, 0);	//
			exit(0);
		}else {
			printf("caudn't attach the shared memary!\n");
			shmctl(handle, IPC_RMID, 0);	// cleanup work
		}
	}else {
		printf("shared memary allacatian failed!\n");
	}
	exit(1);
}

user_type validate(int argc, char *argv[]) {
	if ((argc > 1) && (strlen(argv[1]) >= 2)) {
		if (strncmp(argv[1], "-s", 2) == 0) {
			return SERVER;	
		}else if (strncmp(argv[1], "-c", 2) == 0) {
			return CLIENT;
		}
	}
	return INVALID;
}

void routine(char *shm, char my_turn, char his_turn) {
	char *buff = malloc(MSG_LEN * sizeof(char));
	char *s = shm;	
	while (1) {
		while (*shm != my_turn) sleep(1);
		print_msg(shm + 1);  // since the first byte is used to determine whose turn it is
		printf(">> ");
		readline(buff, MSG_LEN);
		if (strcmp(buff, "q") == 0) return;
		write_and_flush(his_turn, shm, buff);
	}
}

void print_msg(char *msg_src) {
	char *pos;
	for (pos = msg_src; *pos != '\0'; pos++) {
		printf("%c", *pos);
		*pos = '\0';  // flushing the shm
	}
	printf("\n"); 
}

void readline(char *into, int size) {
	int read, i;
	for (i = 0; i < size; i++) {
		read = getchar();
		*(into + i) = read;
		if ((read == '\n') || (i == size - 1)) break;
	}
	*(into + i) = '\0';
}

void write_and_flush(char next_turn, char *dest, char *src) {
	char *pos;
	int i = 1;
	for (pos = src; *pos != '\0'; pos++) {
		*(dest + i) = *pos;
		*pos = '\0'; 		// cleaning the buffer
		i++;
	}

	*dest = next_turn; // mark the first byte to whose turn it is to write next
}